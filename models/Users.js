import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const Users = mongoose.model("User", UsersSchema);
