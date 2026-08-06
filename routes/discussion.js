import * as dotenv from "dotenv";
import express from "express";
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

dotenv.config();

const router = express.Router();

sendGrid.setApiKey(process.env.SEND_GRID_API_KEY);

router.get("/all", requireAdmin, async (req, res) => {
  try {
    const discussions = await Discussions.find().sort({ createdAt: -1 });
    res.status(200).json(discussions);
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
    res.status(200).json(contacts);
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
    res.status(200).json(contact);
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
    res.status(200).json(contacts);
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
    res.status(200).json(contact);
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
    res.status(200).json("Discussion has been deleted");
  } catch (error) {
    console.error("Hamma contact delete failed:", error);
    res.status(500).json({ msg: "Failed to delete Hamma contact" });
  }
});

router.get("/single/:id", requireAdmin, async (req, res) => {
  try {
    const discussion = await Discussions.findById(req.params.id);
    res.status(200).json(discussion);
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
    await Discussions.findByIdAndDelete(req.params.id);
    res.status(200).json("Discussion has been deleted");
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete discussion" });
  }
});

export default router;
