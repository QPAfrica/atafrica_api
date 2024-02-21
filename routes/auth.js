import * as dotenv from "dotenv";
import express from "express";
import { Users} from "../models/Users.js"
import CryptoJS from "crypto-js";


dotenv.config();

const router = express.Router();


router.post("/register", async (req, res) => {

  const newUser = new Users({
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
  });


  try {
    const savedUser = await newUser.save();
    res.status(201).json({
      data: savedUser,
      msg: "Account Creation Successful",
    });
  } catch (error) {
    res.json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    !user && res.status(401).json("Wrong Email!!!");

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY
    );

    const password = decryptedPassword.toString(CryptoJS.enc.Utf8);

    password !== req.body.password && res.status(401).json("Wrong Password!!!");

    res.status(200).json(user.email);
  } catch (err) {
    res.json(err);
  }
});


router.get("/users/:id", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.params.id });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const user = await Users.find();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


router.delete("/users/:id", async (req, res) => {
  try {
    await Users.findOneAndDelete({ email: req.params.id });
    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
})

export default router;
