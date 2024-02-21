import mongoose from "mongoose";

const DiscussionsSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String},
    email: { type: String},
    phone: { type: String},
    message:{type: String}
  },
  { timestamps: true }
);

export const Discussions = mongoose.model("Discussion", DiscussionsSchema);