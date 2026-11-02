/**
 * Local-only Jev backfill: classifies every contact message that has no
 * label yet, across Mongo sources and the Sabi/Hamma Postgres contacts.
 * Already-labelled messages (including admin overrides) are left alone.
 * Usage:
 *   npm run classify-backlog                    # classify everything missing
 *   npm run classify-backlog -- --dry-run       # only count what's missing
 *   npm run classify-backlog -- --source=sabi   # one source
 *   npm run classify-backlog -- --limit=50      # at most 50 per source
 */
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { Discussions } from "../models/Discussions.js";
import { ContactClassifications } from "../models/ContactClassifications.js";
import {
  classifyContact,
  isClassificationConfigured,
} from "../utils/contactClassification.js";
import { isSabiDbConfigured, listSabiContacts } from "../utils/sabiContacts.js";
import { isHammaDbConfigured, listHammaContacts } from "../utils/hammaContacts.js";

dotenv.config();

const MONGO_SOURCES = ["atafrica", "saturday", "ft9ja", "clipperfc", "qpafrica"];
const ALL_SOURCES = [...MONGO_SOURCES, "sabi", "hamma"];
const CONCURRENCY = 5;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sourceArg = args.find((arg) => arg.startsWith("--source="))?.split("=")[1];
const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
const limit = limitArg ? Number(limitArg) : Infinity;

if (sourceArg && !ALL_SOURCES.includes(sourceArg)) {
  console.error(`Unknown source "${sourceArg}". Use one of: ${ALL_SOURCES.join(", ")}`);
  process.exit(1);
}
if (limitArg && !(Number.isInteger(limit) && limit > 0)) {
  console.error("--limit must be a positive integer");
  process.exit(1);
}
if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL must be set in .env");
  process.exit(1);
}
if (!dryRun && !isClassificationConfigured()) {
  console.error("TYPESAFE_API_KEY must be set in .env (or use --dry-run)");
  process.exit(1);
}

async function loadContacts(source) {
  if (source === "sabi") return isSabiDbConfigured() ? listSabiContacts() : null;
  if (source === "hamma") return isHammaDbConfigured() ? listHammaContacts() : null;
  // Older documents predate `source` and default to atafrica.
  const filter =
    source === "atafrica"
      ? { $or: [{ source: "atafrica" }, { source: { $exists: false } }] }
      : { source };
  return Discussions.find(filter).sort({ createdAt: -1 }).lean();
}

async function backfillSource(source) {
  const contacts = await loadContacts(source);
  if (!contacts) {
    console.log(`${source}: skipped (${source.toUpperCase()}_DATABASE_URL not set)`);
    return { classified: 0, failed: 0 };
  }

  const labelled = new Set(
    (await ContactClassifications.find({ source }, { messageId: 1 })).map(
      (doc) => doc.messageId
    )
  );
  const missing = contacts.filter((contact) => !labelled.has(String(contact._id)));
  const pending = missing.slice(0, limit);

  console.log(
    `${source}: ${contacts.length} messages, ${missing.length} unlabelled` +
      (dryRun ? "" : `, classifying ${pending.length}`)
  );
  if (dryRun) return { classified: 0, failed: 0 };

  const counts = { dangerous: 0, spam: 0, ok: 0, important: 0 };
  let failed = 0;
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((contact) => classifyContact(source, contact))
    );
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        counts[result.value.label] += 1;
      } else {
        failed += 1;
        console.error(`  ${source}/${batch[index]._id} failed: ${result.reason?.message}`);
      }
    });
    process.stdout.write(`  ${Math.min(i + CONCURRENCY, pending.length)}/${pending.length}\r`);
  }

  const classified = pending.length - failed;
  console.log(
    `  done: ${Object.entries(counts)
      .map(([label, count]) => `${label} ${count}`)
      .join(", ")}${failed ? `, failed ${failed}` : ""}`
  );
  return { classified, failed };
}

try {
  await mongoose.connect(process.env.MONGODB_URL);

  let classified = 0;
  let failed = 0;
  for (const source of sourceArg ? [sourceArg] : ALL_SOURCES) {
    const result = await backfillSource(source);
    classified += result.classified;
    failed += result.failed;
  }

  if (!dryRun) {
    console.log(`Classified ${classified} message(s)${failed ? `, ${failed} failed` : ""}.`);
  }
  process.exitCode = failed ? 1 : 0;
} catch (err) {
  console.error("Backfill failed:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
  // pg pools for Sabi/Hamma keep the event loop alive.
  process.exit();
}
