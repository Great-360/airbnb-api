import { Router, Response, NextFunction } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { deleteReview } from "../controllers/review.controller.js";

const router = Router();

// DELETE /reviews/:id - Protected endpoint (requires auth)
router.delete("/reviews/:id", authentication, deleteReview);

export default router;
