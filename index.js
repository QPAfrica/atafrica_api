import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import homeRoute from "./routes/home.js";
import authRoute from "./routes/auth.js";
import jobRoute from "./routes/job.js";
import applicationRoute from "./routes/application.js";
import newsletterRoute from "./routes/newsletter.js";
import discussionRoute from "./routes/discussion.js";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("DB Connection Successful!!!"))
  .catch((err) => console.log(err));

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:3000,https://www.atafrica.org,https://atafrica.org"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) send no Origin
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());
app.use("/", homeRoute);
app.use("/api/auth", authRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/discussion", discussionRoute);

app.listen(process.env.PORT || 2000, () => {
  console.log("Server Connected!!!");
});
