import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";
import { ListingType } from "@prisma/client";
import { getCache, setCache, deleteCacheByPrefix } from "../config/cache.js";
import { HOST_PUBLIC_SELECT, sanitizeHost } from "../utils/listing.utils.js";

const LISTINGS_STATS_CACHE_KEY = "listings:stats";
const CACHE_TTL_SECONDS = 300; // 5 minutes


export const searchListings = async (req: Request, res: Response): Promise<void> => {
  // Extract query parameters with defaults
  const location = req.query.location as string | undefined;
  const type = req.query.type as string | undefined;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
  const guests = req.query.guests ? parseInt(req.query.guests as string) : undefined;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  // Build conditional where object - only add filters if params exist
  const where: any = {};

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  if (type) {
    // Validate type against enum
    const validTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN'];
    const upperType = type.toUpperCase();
    if (validTypes.includes(upperType)) {
      where.type = upperType as ListingType;
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerNight = {};
    if (minPrice !== undefined) {
      where.pricePerNight.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.pricePerNight.lte = maxPrice;
    }
  }

  if (guests !== undefined) {
    where.guests = {
      gte: guests,
    };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Execute query with filters, pagination, and include host info
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take,
      include: {
        host: {
          select: {
            name: true,
            email: true,
          },
        },
        photos: true,
      },
    }),
    prisma.listing.count({ where }),
  ]);

  // Return results with pagination metadata
  res.json({
    data: listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
},
  });
};

export const getListingsStats = async (req: Request, res: Response): Promise<void> => {
  // Check cache first
  const cached = await getCache<{
    totalListings: number;
    averagePrice: number;
    byLocation: { location: string; _count: { location: number } }[];
    byType: { type: string; _count: { type: number } }[];
  }>(LISTINGS_STATS_CACHE_KEY);

  if (cached) {
    res.json(cached);
    return;
  }

  // Execute all queries in parallel
  const [totalListingsResult, averagePriceResult, byLocationResult, byTypeResult] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.aggregate({
      _avg: { pricePerNight: true },
    }),
    prisma.listing.groupBy({
      by: ["location"],
      _count: { location: true },
    }),
    prisma.listing.groupBy({
      by: ["type"],
      _count: { type: true },
    }),
  ]);

  const result = {
    totalListings: totalListingsResult,
    averagePrice: averagePriceResult._avg.pricePerNight || 0,
    byLocation: byLocationResult.map((item) => ({
      location: item.location,
      _count: { location: item._count.location },
    })),
    byType: byTypeResult.map((item) => ({
      type: item.type.toLowerCase(),
      _count: { type: item._count.type },
    })),
  };

  // Cache for 5 minutes
  await setCache(LISTINGS_STATS_CACHE_KEY, result, CACHE_TTL_SECONDS);

  res.json(result);
};

export const getAllListings = async (req: Request, res: Response): Promise<void> => {
  const listings = await prisma.listing.findMany({
    include: {
      host: {
        select: {
          name: true,
          avatar: true,
        },
      },
      photos: true,
    },
  });
  res.json(listings);
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id as string;
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      host: { select: HOST_PUBLIC_SELECT },
      photos: true,
    },
  });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const { host, ...listingFields } = listing;
  res.json({
    ...listingFields,
    host: sanitizeHost(host),
  });
};


export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, pricePerNight, location, type, amenities, guests } = req.body;
  const hostId = req.userId;
  if (!title || !description || !pricePerNight || !location || !type || !hostId || guests == null) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const host = await prisma.user.findUnique({ where: { id: hostId } });
  if (!host) {
    res.status(404).json({ error: "Host not found" });
    return;
  }
const newListing = await prisma.listing.create({
    data: {
      title,
      description,
      location,
      pricePerNight,
      type,
      guests,
      amenities: amenities || [],
      host: { connect: { id: hostId } },
    },
  });

  // Clear listings stats cache
  await deleteCacheByPrefix(LISTINGS_STATS_CACHE_KEY);

  res.status(201).json(newListing);
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  const id: string = req.params.id as string;
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (listing.hostId !== req.userId && req.role !== "ADMIN") {
    res.status(403).json({ error: "You can only edit your own listings" });
    return;
  }
  const updatedListing = await prisma.listing.update({
    where: { id },
    data: req.body,
  });

  // Clear listings stats cache
  await deleteCacheByPrefix(LISTINGS_STATS_CACHE_KEY);

  res.json(updatedListing);
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  const id: string = req.params.id as string;
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
if (listing.hostId !== req.userId && req.role !== "ADMIN") {
    res.status(403).json({ error: "You can only delete your own listings" });
    return;
  }
  const deletedListing = await prisma.listing.delete({ where: { id } });

  // Clear listings stats cache
  await deleteCacheByPrefix(LISTINGS_STATS_CACHE_KEY);

  res.json({ message: "Listing deleted successfully", listing: deletedListing });
};