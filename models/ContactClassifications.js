import mongoose from "mongoose";

// Keyed by (source, messageId) so it covers Mongo discussions and the
// read-only Sabi/Hamma Postgres contacts alike.
const ContactClassificationsSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    messageId: { type: String, required: true },
    label: {
      type: String,
      enum: ["dangerous", "spam", "ok", "important"],
      required: true,
    },
    confidence: { type: Number },
    probabilities: { type: Map, of: Number },
    model: { type: String },
    classifiedBy: { type: String, enum: ["jev", "admin"], default: "jev" },
  },
  { timestamps: true }
);

ContactClassificationsSchema.index({ source: 1, messageId: 1 }, { unique: true });

export const ContactClassifications = mongoose.model(
  "ContactClassification",
  ContactClassificationsSchema
);
