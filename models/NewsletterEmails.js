import mongoose from "mongoose";

const NewsletterEmailsSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
  },
  { timestamps: true }
);

export const NewsletterEmails = mongoose.model("NewsletterEmail", NewsletterEmailsSchema);