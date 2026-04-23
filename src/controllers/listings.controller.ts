import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

export const getAllListings = async (req: Request, res: Response): Promise<void> => {
  const listings = await prisma.listing.findMany({
    include: {
      host: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  });
  res.json(listings);
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  const idStr = req.params.id;
  if (!idStr || isNaN(parseInt(idStr))) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parseInt(idStr);
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { host: true, bookings: true },
  });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(listing);
};

export const createListing = async (req: Request, res: Response): Promise<void> => {
  const { title, description, pricePerNight, location, type, amenities, hostId, guests } = req.body;
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
  res.status(201).json(newListing);
};

export const updateListing = async (req: Request, res: Response): Promise<void> => {
  const idStr = req.params.id;
  if (!idStr || isNaN(parseInt(idStr))) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parseInt(idStr);
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  const updatedListing = await prisma.listing.update({
    where: { id },
    data: req.body,
  });
  res.json(updatedListing);
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
  const idStr = req.params.id;
  if (!idStr || isNaN(parseInt(idStr))) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parseInt(idStr);
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  const deletedListing = prisma.listing.delete({ where: { id } });
  res.json({ message: "Listing deleted successfully", listing: deletedListing });
};
