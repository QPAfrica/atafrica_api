import mongoose from "mongoose";

const ApplicationsSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String},
    email: { type: String},
    phone: { type: String},
    resume:{type: String},
    jobTitle: { type: String },
    coverLetterType: { type: String },
    coverLetter: { type: String },
    additionalInfo: { type: String },
  },
  { timestamps: true }
);

export const Applications = mongoose.model("Application", ApplicationsSchema);