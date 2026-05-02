import { Router, Response, NextFunction } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import {
  getListingReviews,
  createReview,
  deleteReview
} from "../controllers/review.controller.js";

const router = Router();

// GET /listings/:id/reviews - Public endpoint (paginated)
router.get("/listings/:id/reviews", getListingReviews);

// POST /listings/:id/reviews - Protected endpoint (requires auth)
router.post("/listings/:id/reviews", authentication, createReview);

// DELETE /reviews/:id - Protected endpoint (requires auth)
router.delete("/reviews/:id", authentication, deleteReview);

export default router;
