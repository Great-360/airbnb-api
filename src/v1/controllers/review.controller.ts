import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";
import { getCache, setCache, deleteCache, deleteCacheByPrefix } from "../config/cache.js";
import { formatReview } from "../utils/listing.utils.js";

// API summary cache prefix - kept for future use when AI summary feature is implemented
const REVIEW_SUMMARY_CACHE_PREFIX = "ai:review-summary:";

async function syncListingReviewStats(listingId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { listingId },
    _count: { _all: true },
    _avg: { rating: true },
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      reviewCount: agg._count._all,
      rating: agg._count._all > 0 ? agg._avg.rating : null,
    },
  });
}

export async function getListingReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const pageNum = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10));
    const limitNum = Math.max(1, parseInt(String(req.query["limit"] ?? "10"), 10));

    const cacheKey = `reviews:listing:${id}:${pageNum}:${limitNum}`;
    const cached = await getCache<unknown>(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      res.status(200).json(cached);
      return;
    }

    const listingExists = await prisma.listing.findFirst({ where: { id: String(id) } });
    if (!listingExists) {
      res.status(404).json({ error: `Listing with id ${id} not found` });
      return;
    }

    const listingId = String(id);

    const [reviews, total, ratingAgg] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.review.count({ where: { listingId } }),
      prisma.review.aggregate({
        where: { listingId },
        _avg: { rating: true },
      }),
    ]);

    const averageRating =
      total > 0 && ratingAgg._avg.rating != null
        ? Math.round(ratingAgg._avg.rating * 100) / 100
        : null;

    const result = {
      data: reviews.map(formatReview),
      meta: { total, averageRating },
    };

    await setCache(cacheKey, result, 30); // 30-second cache
    res.setHeader("X-Cache", "MISS");
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId!;

    if (!rating || !comment) {
      res.status(400).json({ error: "Missing required fields: rating, comment" });
      return;
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "rating must be an integer between 1 and 5" });
      return;
    }

    const listing = await prisma.listing.findFirst({ where: { id: String(id) } });
    if (!listing) {
      res.status(404).json({ error: `Listing with id ${id} not found` });
      return;
    }

    const listingId = String(id);

    const review = await prisma.review.create({
      data: { rating: ratingNum, comment, userId, listingId },
      include: { user: { select: { name: true, avatar: true } } },
    });

    await syncListingReviewStats(listingId);

    // Invalidate review cache and AI summary cache for this listing
    await Promise.all([
      deleteCacheByPrefix(`reviews:listing:${id}:`),
      deleteCache(`${REVIEW_SUMMARY_CACHE_PREFIX}${id}`),
    ]);

    res.status(201).json(formatReview(review));
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const review = await prisma.review.findFirst({ where: { id: String(id) } });
    if (!review) {
      res.status(404).json({ error: `Review with id ${id} not found` });
      return;
    }

    if (review.userId !== req.userId && req.role !== "ADMIN") {
      res.status(403).json({ error: "You can only delete your own reviews" });
      return;
    }

    await prisma.review.delete({ where: { id: String(id) } });
    await syncListingReviewStats(review.listingId);

    // Invalidate review cache for the listing
    await deleteCacheByPrefix(`reviews:listing:${review.listingId}:`);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export default {
  getListingReviews,
  createReview,
  deleteReview
};
