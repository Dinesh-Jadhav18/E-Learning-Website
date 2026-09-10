import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================

app.use(
    cors({
        origin: "https://e-learning-website-five-alpha.vercel.app",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json({ limit: "16kb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(express.static("public"));

app.use(cookieParser());

// ===============================
// RAZORPAY
// ===============================

export const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

// ===============================
// STUDENT ROUTES
// ===============================

import studentRouter from "./routes/student.routes.js";

app.use("/api/student", studentRouter);

// ===============================
// TEACHER ROUTES
// ===============================

import teacherRouter from "./routes/teacher.routes.js";

app.use("/api/teacher", teacherRouter);

// ===============================
// COURSE ROUTES
// ===============================

import courseRouter from "./routes/course.routes.js";

app.use("/api/course", courseRouter);

// ===============================
// ADMIN ROUTES
// ===============================

import adminRouter from "./routes/admin.routes.js";

app.use("/api/admin", adminRouter);

// ===============================
// PAYMENT ROUTES
// ===============================

import paymentRouter from "./routes/payment.routes.js";

app.use("/api/payment", paymentRouter);

export { app };