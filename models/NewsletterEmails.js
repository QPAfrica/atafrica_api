import mongoose from "mongoose";

const NewsletterEmailsSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    source: {
      type: String,
      enum: ["atafrica", "clipperfc"],
      default: "atafrica",
    },
  },
  { timestamps: true }
);

export const NewsletterEmails = mongoose.model(
  "NewsletterEmail",
  NewsletterEmailsSchema
);
