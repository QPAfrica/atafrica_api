import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { Discussions } from "../models/Discussions.js";
import sendGrid from "@sendgrid/mail";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  buildContactConfirmationEmail,
  normalizeContactSource,
} from "../utils/contactConfirmationEmail.js";
import {
  deleteSabiContactById,
  getSabiContactById,
  isSabiDbConfigured,
  listSabiContacts,
} from "../utils/sabiContacts.js";
import {
  deleteHammaContactById,
  getHammaContactById,
  isHammaDbConfigured,
  listHammaContacts,
} from "../utils/hammaContacts.js";
import {
  attachClassifications,
  classifyContact,
  CONTACT_LABELS,
  deleteContactClassification,
  isClassificationConfigured,
  setContactLabel,
} from "../utils/contactClassification.js";

dotenv.config();

const router = express.Router();

sendGrid.setApiKey(process.env.SEND_GRID_API_KEY);

const mongoSourceOf = (discussion) => discussion.source || "atafrica";

async function withClassification(contact, source) {
  if (!contact) return contact;
  const [classified] = await attachClassifications([contact], () => source);
  return classified;
}

async function getContactBySource(source, id) {
  if (source === "sabi") return getSabiContactById(id);
  if (source === "hamma") return getHammaContactById(id);
  if (!mongoose.isValidObjectId(id)) return null;
  const discussion = await Discussions.findById(id);
  return discussion && mongoSourceOf(discussion) === source ? discussion : null;
}

router.get("/all", requireAdmin, async (req, res) => {
  try {
    // Optional ?source= keeps lazy classification scoped to the tab being viewed;
    // ?classify=false skips Jev for callers that only need counts.
    const source = req.query.source && normalizeContactSource(req.query.source);
    // Older documents predate `source` and count as atafrica.
    const filter = !source
      ? {}
      : source === "atafrica"
        ? { $or: [{ source }, { source: { $exists: false } }] }
        : { source };
    const discussions = await Discussions.find(filter).sort({ createdAt: -1 });
    res.status(200).json(
      await attachClassifications(discussions, mongoSourceOf, {
        classifyMissing: req.query.classify !== "false",
      })
    );
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch discussions" });
  }
});

router.get("/sabi", requireAdmin, async (req, res) => {
  try {
    if (!isSabiDbConfigured()) {
      return res.status(503).json({
        msg: "SABI_DATABASE_URL is not configured on atafrica_api",
      });
    }
    const contacts = await listSabiContacts();
    res.status(200).json(await attachClassifications(contacts, () => "sabi"));
  } catch (error) {
    console.error("Sabi contact list failed:", error);
    res.status(500).json({ msg: "Failed to fetch Sabi contacts" });
  }
});

router.get("/sabi/:id", requireAdmin, async (req, res) => {
  try {
    if (!isSabiDbConfigured()) {
      return res.status(503).json({
        msg: "SABI_DATABASE_URL is not configured on atafrica_api",
      });
    }
    const contact = await getSabiContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    res.status(200).json(await withClassification(contact, "sabi"));
  } catch (error) {
    console.error("Sabi contact fetch failed:", error);
    res.status(500).json({ msg: "Failed to fetch Sabi contact" });
  }
});

router.delete("/sabi/:id", requireAdmin, async (req, res) => {
  try {
    if (!isSabiDbConfigured()) {
      return res.status(503).json({
        msg: "SABI_DATABASE_URL is not configured on atafrica_api",
      });
    }
    const deleted = await deleteSabiContactById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    await deleteContactClassification("sabi", req.params.id);
    res.status(200).json("Discussion has been deleted");
  } catch (error) {
    console.error("Sabi contact delete failed:", error);
    res.status(500).json({ msg: "Failed to delete Sabi contact" });
  }
});

router.get("/hamma", requireAdmin, async (req, res) => {
  try {
    if (!isHammaDbConfigured()) {
      return res.status(503).json({
        msg: "HAMMA_DATABASE_URL is not configured on atafrica_api",
      });
    }
    const contacts = await listHammaContacts();
    res.status(200).json(await attachClassifications(contacts, () => "hamma"));
  } catch (error) {
    console.error("Hamma contact list failed:", error);
    res.status(500).json({ msg: "Failed to fetch Hamma contacts" });
  }
});

router.get("/hamma/:id", requireAdmin, async (req, res) => {
  try {
    if (!isHammaDbConfigured()) {
      return res.status(503).json({
        msg: "HAMMA_DATABASE_URL is not configured on atafrica_api",
      });
    }
    const contact = await getHammaContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    res.status(200).json(await withClassification(contact, "hamma"));
  } catch (error) {
    console.error("Hamma contact fetch failed:", error);
    res.status(500).json({ msg: "Failed to fetch Hamma contact" });
  }
});

router.delete("/hamma/:id", requireAdmin, async (req, res) => {
  try {
    if (!isHammaDbConfigured()) {
      return res.status(503).json({
        msg: "HAMMA_DATABASE_URL is not configured on atafrica_api",
      });
    }
    const deleted = await deleteHammaContactById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    await deleteContactClassification("hamma", req.params.id);
    res.status(200).json("Discussion has been deleted");
  } catch (error) {
    console.error("Hamma contact delete failed:", error);
    res.status(500).json({ msg: "Failed to delete Hamma contact" });
  }
});

router.get("/single/:id", requireAdmin, async (req, res) => {
  try {
    const discussion = await Discussions.findById(req.params.id);
    res
      .status(200)
      .json(
        discussion
          ? await withClassification(discussion, mongoSourceOf(discussion))
          : discussion
      );
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch discussion" });
  }
});

router.post("/add", async (req, res) => {
  const source = normalizeContactSource(req.body.source);
  // Product backends own their outbound mail; ClipperFC opted out of API confirmations.
  const skipConfirmationEmail =
    source === "ft9ja" || source === "clipperfc" || source === "qpafrica";

  const newDiscussion = new Discussions({
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    message: req.body.message,
    source,
  });

  try {
    const savedDiscussion = await newDiscussion.save();

    if (!skipConfirmationEmail) {
      const messageData = buildContactConfirmationEmail({
        firstName: req.body.first_name,
        email: req.body.email,
        source,
      });
      await sendGrid.send(messageData);
    }

    res.status(201).json({
      data: savedDiscussion,
      msg: skipConfirmationEmail
        ? "Discussion Creation Successful."
        : "Discussion Creation Successful and email sent.",
    });
  } catch (error) {
    res.status(500).json({ msg: "Discussion creation failed" });
  }
});

router.delete("/delete/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Discussions.findByIdAndDelete(req.params.id);
    if (deleted) {
      await deleteContactClassification(mongoSourceOf(deleted), req.params.id);
    }
    res.status(200).json("Discussion has been deleted");
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete discussion" });
  }
});

// Admin override: PUT { label } sets the label by hand.
router.put("/classification/:source/:id", requireAdmin, async (req, res) => {
  const { source, id } = req.params;
  const { label } = req.body;
  if (!CONTACT_LABELS.includes(label)) {
    return res
      .status(400)
      .json({ msg: `label must be one of: ${CONTACT_LABELS.join(", ")}` });
  }
  try {
    const contact = await getContactBySource(source, id);
    if (!contact) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    res.status(200).json(await setContactLabel(source, id, label));
  } catch (error) {
    console.error("Contact label update failed:", error);
    res.status(500).json({ msg: "Failed to update classification" });
  }
});

// Re-run Jev on one message, replacing any stored (or admin) label.
router.post("/classification/:source/:id", requireAdmin, async (req, res) => {
  const { source, id } = req.params;
  if (!isClassificationConfigured()) {
    return res.status(503).json({
      msg: "TYPESAFE_API_KEY is not configured on atafrica_api",
    });
  }
  try {
    const contact = await getContactBySource(source, id);
    if (!contact) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    res.status(200).json(await classifyContact(source, contact));
  } catch (error) {
    console.error("Contact classification failed:", error);
    res.status(502).json({ msg: "Jev classification failed" });
  }
});

export default router;
