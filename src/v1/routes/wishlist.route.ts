
import { Router } from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import {
  getWishlistIds,
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

const router = Router();


router.use(authentication);

/**
 * @swagger
 * /wishlists/ids:
 *   get:
 *     tags: [Wishlists]
 *     summary: Get IDs of all listings the current user has saved
 *     description: Lightweight endpoint — returns only IDs, used to render filled hearts on listing cards.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of listing IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/ids", getWishlistIds);

/**
 * @swagger
 * /wishlists:
 *   get:
 *     tags: [Wishlists]
 *     summary: Get all listings saved by the current user (full objects)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of full listing objects
 */
router.get("/", getMyWishlist);

/**
 * @swagger
 * /wishlists/{listingId}:
 *   post:
 *     tags: [Wishlists]
 *     summary: Save a listing to wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Saved successfully
 *       404:
 *         description: Listing not found
 */
router.post("/:listingId", addToWishlist);

/**
 * @swagger
 * /wishlists/{listingId}:
 *   delete:
 *     tags: [Wishlists]
 *     summary: Remove a listing from wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed successfully
 *       404:
 *         description: Not in wishlist
 */
router.delete("/:listingId", removeFromWishlist);

export default router;