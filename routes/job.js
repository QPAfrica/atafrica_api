import * as dotenv from "dotenv";
import express from "express";
import { Jobs } from "../models/Jobs.js";


dotenv.config();

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const jobs = await Jobs.find();
        res.status(201).json(jobs);
    } catch (error) {
        res.json(error);
    }
});

router.get("/single/:id", async (req, res) => {
    try {
        const job = await Jobs.findById(req.params.id);
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.post("/add", async (req, res) => {

    const newJob = new Jobs({
        title: req.body.title,
        category: req.body.category,
        location: req.body.location,
        type: req.body.type,
        company: req.body.company,
        mainDesc:req.body.main_desc,
        lookingDesc: req.body.looking_desc,
        experienceDesc: req.body.experience_desc,
        benefitsDesc: req.body.benefits_desc,
        lookingPoints: req.body.looking_points,
        experiencePoints: req.body.experience_points,
        benefitsPoints: req.body.benefits_points,
    });


    try {
        const savedJob = await newJob.save();
        res.status(201).json({
            data: savedJob,
            msg: "Job Creation Successful",
        });
    } catch (error) {
        res.json(error);
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        await Jobs.findByIdAndDelete(req.params.id);
        res.status(200).json("Job has been deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.put("/update/:id", async (req, res) => {
    try {
        const updatedJob = await Jobs.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedJob);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

export default router;