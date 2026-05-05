import { Router } from "express";

import authRouter from "../v1/routes/auth.route.js";
import usersRouter from "../v1/routes/users.route.js";
import listingsRouter from "../v1/routes/listings.route.js";
import bookingsRouter from "../v1/routes/bookings.route.js";
import reviewsRouter from "../v1/routes/review.route.js";
import aiRouter from "../v1/routes/ai.route.js";
import uploadRouter from "../v1/routes/upload.route.js";

import { generalLimiter, strictLimiter } from "../middlewares/rateLimiter.js";

const v1Router = Router();

// Apply general limiter (100 requests per 15 minutes) to all routes
v1Router.use(generalLimiter);

// Apply strict limiter (20 POST requests per 15 minutes) to POST routes
v1Router.use(strictLimiter);

v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/listings", listingsRouter);
v1Router.use("/bookings", bookingsRouter);
v1Router.use("/reviews", reviewsRouter);
v1Router.use("/ai", aiRouter);
v1Router.use("/upload", uploadRouter);

export default v1Router;
