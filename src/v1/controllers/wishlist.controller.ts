

import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";

export async function getWishlistIds(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;

  const rows = await prisma.wishlist.findMany({
    where: { userId },
    select: { listingId: true }, // only the ID, nothing else
  });

  const ids = rows.map((r) => r.listingId);
  res.json({ ids });
}

export async function getMyWishlist(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;

  const wishlistRows = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          host:   { select: { name: true, avatar: true } },
          photos: true,
        },
      },
    },
  });

  
  const listings = wishlistRows.map((w) => w.listing);
  res.json(listings);
}


export async function addToWishlist(req: AuthRequest, res: Response): Promise<void> {
  const userId    = req.userId!;
  const listingId = req.params.listingId;

  // Make sure the listing exists before saving it
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  
  const wishlist = await prisma.wishlist.upsert({
    where:  { userId_listingId: { userId, listingId } },
    update: {},                    // already exists → no-op
    create: { userId, listingId },
  });

  res.status(201).json({ saved: true, wishlistId: wishlist.id });
}

export async function removeFromWishlist(req: AuthRequest, res: Response): Promise<void> {
  const userId    = req.userId!;
  const listingId = req.params.listingId;

  const existing = await prisma.wishlist.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (!existing) {
    res.status(404).json({ error: "Listing not in wishlist" });
    return;
  }

  await prisma.wishlist.delete({
    where: { userId_listingId: { userId, listingId } },
  });

  res.json({ saved: false });
}