import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import { ContactClassifications } from "../models/ContactClassifications.js";

export const CONTACT_LABELS = ["dangerous", "spam", "ok", "important"];

// Unclassified messages are classified lazily when an admin lists them.
// Cap the work per request so a large backlog can't stall the list page.
const MAX_CLASSIFY_PER_REQUEST = 25;
const CLASSIFY_CONCURRENCY = 5;

const WEBSITE_NAMES = {
  atafrica: "ATAfrica",
  saturday: "Saturday",
  ft9ja: "FT9ja",
  sabi: "Sabi",
  clipperfc: "ClipperFC",
  hamma: "Hamma",
  qpafrica: "QPAfrica",
};

const categoryQuestion = choice(
  "Classify this message submitted through a company website's Contact Us form, so the team knows how to treat it.",
  {
    dangerous:
      "Malicious or harmful: phishing, scams, fraud, impersonation, requests for credentials or payments, suspicious links or attachments, threats, harassment, extortion, or code/script injection attempts.",
    spam:
      "Unsolicited junk that is not harmful: marketing pitches, SEO, web design or link-building offers, lead-generation or bulk outreach, bot submissions, or gibberish.",
    ok: "A genuine message from a real person that can be handled routinely: general questions, feedback, or ordinary requests.",
    important:
      "A genuine message that needs prompt attention from the team: partnership, investment, media or business opportunities, complaints, legal or compliance matters, or a customer who is blocked or losing money.",
  }
);

let client = null;

export function isClassificationConfigured() {
  return Boolean(process.env.TYPESAFE_API_KEY?.trim());
}

function getClient() {
  if (!client) {
    client = new TypeSafeClient({ timeout: 8000 });
  }
  return client;
}

function buildState(source, contact) {
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const state = {
    website: WEBSITE_NAMES[source] ?? source,
    sender_name: name,
    sender_email: contact.email,
    sender_phone: contact.phone,
    topic: contact.topic,
    subject: contact.subject,
    message: contact.message,
  };
  // Drop empty fields so the model isn't distracted by blanks.
  return Object.fromEntries(
    Object.entries(state).filter(([, value]) => value && String(value).trim())
  );
}

function toClassification(doc) {
  if (!doc) return null;
  return {
    label: doc.label,
    confidence: doc.confidence ?? null,
    probabilities: doc.probabilities
      ? Object.fromEntries(doc.probabilities)
      : null,
    model: doc.model ?? null,
    classifiedBy: doc.classifiedBy,
    classifiedAt: doc.updatedAt,
  };
}

/** Ask Jev to classify one contact message and store the result. */
export async function classifyContact(source, contact) {
  const response = await getClient().systemOne({
    state: buildState(source, contact),
    questions: { category: categoryQuestion },
  });
  const answer = response.answers.category;

  const doc = await ContactClassifications.findOneAndUpdate(
    { source, messageId: String(contact._id) },
    {
      label: answer.choice,
      confidence: answer.confidence,
      probabilities: answer.probabilities,
      model: response.model,
      classifiedBy: "jev",
    },
    { upsert: true, new: true }
  );
  return toClassification(doc);
}

/** Record an admin's manual label, overriding Jev. */
export async function setContactLabel(source, messageId, label) {
  const doc = await ContactClassifications.findOneAndUpdate(
    { source, messageId: String(messageId) },
    {
      label,
      classifiedBy: "admin",
      $unset: { confidence: 1, probabilities: 1, model: 1 },
    },
    { upsert: true, new: true }
  );
  return toClassification(doc);
}

export async function deleteContactClassification(source, messageId) {
  await ContactClassifications.deleteOne({
    source,
    messageId: String(messageId),
  });
}

async function classifySafely(source, contact) {
  try {
    return await classifyContact(source, contact);
  } catch (error) {
    console.error(
      `Jev classification failed for ${source}/${contact._id}:`,
      error.message
    );
    return null;
  }
}

/**
 * Attach `classification` to each contact. Stored results are reused;
 * up to MAX_CLASSIFY_PER_REQUEST missing ones (newest first) are classified
 * with Jev. Failures leave `classification: null` rather than failing the list.
 * `getSource` maps a contact to its source, since /all mixes Mongo sources.
 * Pass `{ classifyMissing: false }` to only read stored results.
 */
export async function attachClassifications(
  contacts,
  getSource,
  { classifyMissing = true } = {}
) {
  const plain = contacts.map((contact) =>
    typeof contact.toObject === "function" ? contact.toObject() : contact
  );
  if (plain.length === 0) return plain;

  const stored = await ContactClassifications.find({
    $or: plain.map((contact) => ({
      source: getSource(contact),
      messageId: String(contact._id),
    })),
  });
  const byKey = new Map(
    stored.map((doc) => [`${doc.source}:${doc.messageId}`, toClassification(doc)])
  );
  const keyOf = (contact) => `${getSource(contact)}:${contact._id}`;

  if (classifyMissing && isClassificationConfigured()) {
    const pending = plain
      .filter((contact) => !byKey.has(keyOf(contact)))
      .slice(0, MAX_CLASSIFY_PER_REQUEST);

    for (let i = 0; i < pending.length; i += CLASSIFY_CONCURRENCY) {
      const batch = pending.slice(i, i + CLASSIFY_CONCURRENCY);
      const results = await Promise.all(
        batch.map((contact) => classifySafely(getSource(contact), contact))
      );
      batch.forEach((contact, index) => {
        if (results[index]) byKey.set(keyOf(contact), results[index]);
      });
    }
  }

  return plain.map((contact) => ({
    ...contact,
    classification: byKey.get(keyOf(contact)) ?? null,
  }));
}
