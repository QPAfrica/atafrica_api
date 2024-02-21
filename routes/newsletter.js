import * as dotenv from "dotenv";
import express from "express";
import sendGrid from "@sendgrid/mail";
import { NewsletterEmails } from "../models/NewsletterEmails.js";

dotenv.config();

const router = express.Router();

sendGrid.setApiKey(process.env.SEND_GRID_API_KEY)

router.post("/", async (req, res) => {
    if (!req.body.email) {
        res.status(500).json("Email is required")
    }

    const messageData = {
        to: req.body.email,
        from: "traders@ft9ja.com",
        subject: "Newsletter Subscription Confirmation",
        html: `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap"
                rel="stylesheet" />
        </head>
        
        <body style="background: #ededed; display: grid; padding: 10px 0 10px 0">
            <div style="background: #ffffff; max-width: 600px; width: 100%; padding: 50px 0; margin-left: auto; margin-right: auto;">
                <div style="display: grid; background: white">
                    <div style="
                        width: 90%;
                        display: grid;
                        margin: 0 auto auto;
                      ">
                        <img src="https://res.cloudinary.com/ddlupbcws/image/upload/v1680791936/logo_2_ft9ja_1_fsh9iz.png"
                            alt="" style="width: 201px; margin: 0 auto 0 auto" />
                    </div>
                    <div style="
                   display: grid;
                    background-color: white;
                    width: 100%;
                    height: 293px;
                    ">
                        <img src="https://res.cloudinary.com/ddlupbcws/image/upload/v1687433941/Group_317_q0ls1r.png" alt=""
                            style="width: 222px; margin: auto;" />
                    </div>
                    <div style="
                        margin: 41px auto;
                        display: grid;
                        gap: 24px;
                        border-bottom: 1px solid rgba(128, 128, 128, 0.3);
                        padding-bottom: 63px;
                        width: 90%;
                      ">
                        <h1 style="
                            font-family: 'Open Sans', sans-serif;
                            font-size: 25px;
                            font-weight: 700;
                        ">Newsletter Subscription Confirmation</h1>
                        <p style="
                          font-family: 'Open Sans', sans-serif;
                          font-size: 16px;
                          font-weight: 400;
                        ">
                            Dear Trader</span>
                        </p>
                        <p style="
                          font-family: 'Open Sans', sans-serif;
                          font-size: 16px;
                          font-weight: 400;
                        ">
                            We would like to extend a warm welcome to you as a new subscriber to our newsletter! We are thrilled
                            that you have decided to join our community and receive updates on the latest news, offers, and
                            promotions from FT9ja Hero.
                        </p>
                        <p style="
                          font-family: 'Open Sans', sans-serif;
                          font-size: 16px;
                          font-weight: 400;
                        ">
                            We confirm that we have received your subscription request, and you will start receiving our
                            newsletters from the next issue onwards. We promise to provide you with the latest information about
                            our products, services, and industry trends.
        
                        </p>
                        <p style="
                          font-family: 'Open Sans', sans-serif;
                          font-size: 16px;
                          font-weight: 400;
                        ">
                            We take your privacy seriously and promise to protect your personal information. You can review our
                            Privacy Policy by visiting <span style="color: #008000; font-weight: 500"><a target="_blank"
                                    style="color: inherit"
                                    href="https://docs.google.com/document/d/1_Avh3t3fzpju1ZHB6MfBLqjjC0iuLfPMm8CfY1lQXKo/edit">Here</a></span>.
                        </p>
                        <p style="
                          font-family: 'Open Sans', sans-serif;
                          font-size: 16px;
                          font-weight: 400;
                        ">
                            Thank you for choosing to subscribe to our newsletter. We are excited to have you as a member of our
                            community!
                        </p>
                        <div style="
                          font-family: 'Open Sans', sans-serif;
                          font-size: 18px;
                          font-weight: 400;
                        ">
                            <span style="margin-bottom: 1000px; font-family: 'Open Sans', sans-serif;
                            font-size: 16px;
                            font-weight: 400;">Regards,</span>
                            <br>
                            <span style="font-family: 'Open Sans', sans-serif;
                            font-size: 16px;
                            font-weight: 400;">FT9ja Team</span>
                        </div>
                    </div>
                    <footer style="display: grid">
                        <div style="
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          margin: 0 auto 20px auto;
                        ">
                            <div style="
                            background: white;
                            display: grid;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                          ">
                                <a href="https://web.facebook.com/ft9ja" style="margin: 2px 0 auto 1px;">
        
                                    <img src="https://res.cloudinary.com/ddlupbcws/image/upload/v1682101673/Group_310_ztnxh0.png"
                                        alt="" style="width: 90%" />
                                </a>
                            </div>
                            <div style="
                            background: white;
                            display: grid;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                          ">
                                <a href="https://www.instagram.com/ft9ja.official/" style="margin: auto 0 auto 2px;">
                                    <img src="https://res.cloudinary.com/ddlupbcws/image/upload/v1682101673/Group_313_rs9ibk.png"
                                        alt="" style="width: 90%;" />
                                </a>
                            </div>
                            <div style="
                            background: white;
                            display: grid;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                          ">
                                <a href=" https://wa.me/2348138462394" style="margin: auto 0 auto 3px;">
        
                                    <img src="https://res.cloudinary.com/ddlupbcws/image/upload/v1682101673/Icons_ng04ca.png"
                                        alt="" style="width: 90%;" />
                                </a>
                            </div>
                        </div>
                        <div style="display: grid; gap: 12px">
                            <p style="
                            font-family: 'Open Sans', sans-serif;
                            font-size: 14px;
                            font-weight: 400;
                            text-align: center;
                          ">
                                Lagos: 30a Oladimeji Alo Street, Lekki Phase 1. <br> <span>(Appointments only)</span>
                            </p>
                            <p style="
                            font-family: 'Open Sans', sans-serif;
                            font-size: 14px;
                            font-weight: 400;
                            text-align: center;
                          ">
                                Abuja: 18 Queen Elizabeth Street, Asokoro. <br> <span>(Appointments only)</span>
                            </p>
                            <p style="
                            font-family: 'Open Sans', sans-serif;
                            font-size: 14px;
                            font-weight: 400;
                            text-align: center;
                          ">
                                You can also connect to our community of Traders here <br>
                                <span style="color: #008000; font-weight: 500">
                                    <a href="https://www.community.ft9ja.com/" target="_blank" style="color: inherit">
                                        https://www.community.ft9ja.com/
                                    </a>
                                </span>
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </body>
        
        </html>`
    }

    const newEmail = new NewsletterEmails({
        email: req.body.email,
    });

    try {
        const savedEmail = await newEmail.save();
        await sendGrid.send(messageData)
        res.status(201).json({
            data: savedEmail,
            msg: "Email has been sent",
        });
    } catch (error) {
        res.json(error);
    }
})


export default router;