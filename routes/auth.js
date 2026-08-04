import * as dotenv from "dotenv";
import express from "express";
import { Users } from "../models/Users.js";
import CryptoJS from "crypto-js";
import { requireAdmin } from "../middleware/requireAdmin.js";

dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json("Wrong Email!!!");
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY
    );

    const password = decryptedPassword.toString(CryptoJS.enc.Utf8);

    if (password !== req.body.password) {
      return res.status(401).json("Wrong Password!!!");
    }

    res.status(200).json(user.email);
  } catch (err) {
    res.status(500).json({ msg: "Login failed" });
  }
});

router.get("/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.params.id }).select(
      "-password"
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await Users.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch users" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    await Users.findOneAndDelete({ email: req.params.id });
    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete user" });
  }
});

export default router;
