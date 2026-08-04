/**
 * Local-only admin user creation. Usage:
 *   npm run create-user -- <email> <password>
 */
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import { Users } from "../models/Users.js";

dotenv.config();

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: npm run create-user -- <email> <password>");
  process.exit(1);
}

if (!process.env.MONGODB_URL || !process.env.SECRET_KEY) {
  console.error("MONGODB_URL and SECRET_KEY must be set in .env");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URL);

  const existing = await Users.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`User already exists: ${email}`);
    process.exit(1);
  }

  await Users.create({
    email: email.toLowerCase(),
    password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString(),
  });

  console.log(`Created user: ${email.toLowerCase()}`);
  console.log("Add this email to ADMIN_EMAILS in atafrica-admin to grant portal access.");
} catch (err) {
  console.error("Failed to create user:", err.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
