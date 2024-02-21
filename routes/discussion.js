import * as dotenv from "dotenv";
import express from "express";
import { Discussions } from "../models/Discussions.js";


dotenv.config();

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const discussions = await Discussions.find();
        res.status(201).json(discussions);
    } catch (error) {
        res.json(error);
    }
});

router.get("/single/:id", async (req, res) => {
    try {
        const discussion = await Discussions.findById(req.params.id);
        res.status(201).json(discussion);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.post("/add", async (req, res) => {

    const newDiscussion = new Discussions({
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
    });


    try {
        const savedDiscussion = await newDiscussion.save();
        res.status(201).json({
            data: savedDiscussion,
            msg: "Discussion Creation Successful",
        });
    } catch (error) {
        res.json(error);
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        await Discussions.findByIdAndDelete(req.params.id);
        res.status(200).json("Discussion has been deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
})

export default router;