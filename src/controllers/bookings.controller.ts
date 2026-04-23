import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  const bookings = await prisma.booking.findMany({
    include: {
      guest: {
        select: { name: true },
      },
      listing: {
        select: { title: true },
      },
    },
  });
  res.json(bookings);
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  const idStr = req.params.id;
  if (!idStr || isNaN(parseInt(idStr))) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parseInt(idStr);
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { guest: true, listing: true },
  });
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const { guestId, listingId, checkIn, checkOut } = req.body;
  if (!guestId || !listingId || !checkIn || !checkOut) {
    res.status(400).json({ error: "Missing required fields: guestId, listingId, checkIn, checkOut" });
    return;
  }
  const guest = await prisma.user.findUnique({ where: { id: guestId } });
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    res.status(400).json({ error: "Invalid checkIn or checkOut dates" });
    return;
  }
  const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = days * listing.pricePerNight;
  const newBooking = await prisma.booking.create({
    data: {
      guestId,
      listingId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'PENDING',
    },
  });
  res.status(201).json(newBooking);
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  const idStr = req.params.id;
  if (!idStr || isNaN(parseInt(idStr))) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parseInt(idStr);
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const deletedBooking = await prisma.booking.delete({ where: { id } });
  res.json({ message: "Booking deleted successfully", booking: deletedBooking });
};
