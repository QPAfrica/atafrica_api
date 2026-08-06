import * as dotenv from "dotenv";
import express from "express";
import { Discussions } from "../models/Discussions.js";
import sendGrid from "@sendgrid/mail";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  buildContactConfirmationEmail,
  normalizeContactSource,
} from "../utils/contactConfirmationEmail.js";

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

  const newDiscussion = new Discussions({
    firstName: req.body.first_name,
    lastName: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message,
    source,
  });

  const messageData = buildContactConfirmationEmail({
    firstName: req.body.first_name,
    email: req.body.email,
    source,
  });

  try {
    const savedDiscussion = await newDiscussion.save();
    await sendGrid.send(messageData);
    res.status(201).json({
      data: savedDiscussion,
      msg: "Discussion Creation Successful and email sent.",
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
