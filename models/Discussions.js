import mongoose from "mongoose";

const DiscussionsSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    subject: { type: String },
    message: { type: String },
    source: {
      type: String,
      enum: ["atafrica", "saturday", "ft9ja", "clipperfc", "qpafrica"],
      default: "atafrica",
    },
  },
  { timestamps: true }
);

export const Discussions = mongoose.model("Discussion", DiscussionsSchema);
