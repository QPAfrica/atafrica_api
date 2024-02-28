import * as dotenv from "dotenv";
import express, { request } from "express";
import { Applications } from "../models/Applications.js";


dotenv.config();

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const applications = await Applications.find();
        res.status(201).json(applications);
    } catch (error) {
        res.json(error);
    }
});

router.get("/single/:id", async (req, res) => {
    try {
        const application = await Applications.findById(req.params.id);
        res.status(201).json(application);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.post("/add", async (req, res) => {

    const newApplication = new Applications({
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        resume: req.body.resume,
        jobTitle: req.body.job_title,
        coverLetterType: req.body.cover_letter_type,
        coverLetter: req.body.cover_letter,
        additionalInfo: req.body.add_info,
    });


    try {
        const savedApplication = await newApplication.save();
        res.status(201).json({
            data: savedApplication,
            msg: "Application Creation Successful",
        });
    } catch (error) {
        res.json(error);
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        await Applications.findByIdAndDelete(req.params.id);
        res.status(200).json("Job has been deleted");
    } catch (err) {
        res.status(500).json(err.message);
    }
})

router.put("/update/:id", async (req, res) => {
    try {
        const updatedApplication = await Applications.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedApplication);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

export default router;