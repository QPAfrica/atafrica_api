import mongoose from "mongoose";

const JobsSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: String},
    location: { type: String},
    type: { type: String},
    company:{type: String},
    mainDesc:{type:String},
    lookingDesc: { type: String },
    experienceDesc: { type: String },
    benefitsDesc: { type: String },
    lookingPoints: { type: Array },
    experiencePoints: { type: Array },
    benefitsPoints: { type: Array },
  },
  { timestamps: true }
);

export const Jobs = mongoose.model("Job", JobsSchema);