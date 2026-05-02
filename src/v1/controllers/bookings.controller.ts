import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import prisma from "../config/prisma.js";
import { sendEmail } from "../config/email.js";
import { bookingConfirmationEmail, bookingCancellationEmail } from "../../templates/emails.js";


function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// POST /bookings - Create a booking with required fields validation
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { listingId, checkIn, checkOut, guests } = req.body;
  const guestId = req.userId as string;
  
  // Return 400 if any required field is missing
  if (!listingId || !checkIn || !checkOut || !guests) {
    res.status(400).json({ error: "Missing required fields: listingId, checkIn, checkOut, guests" });
    return;
  }

  const listingIdStr = listingId as string;
  const guestsNum = Number(guests);

  if (isNaN(guestsNum) || guestsNum < 1) {
    res.status(400).json({ error: "Guests must be a positive number" });
    return;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    res.status(400).json({ error: "Invalid checkIn or checkOut dates" });
    return;
  }
  if (checkOutDate <= checkInDate) {
    res.status(400).json({ error: "checkOut must be after checkIn" });
    return;
  }
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (checkInDate < now) {
    res.status(400).json({ error: "checkIn must be in the future" });
    return;
  }
  
  // Return 404 if listing doesn't exist
  const listing = await prisma.listing.findUnique({ where: { id: listingIdStr } });
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  // Check guest capacity
  if (guestsNum > listing.guests) {
    res.status(400).json({ error: `Number of guests exceeds listing capacity of ${listing.guests}` });
    return;
  }

  // Check for booking conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      listingId: listingIdStr,
      status: "CONFIRMED",
      AND: [
        { checkIn: { lt: checkOutDate } },
        { checkOut: { gt: checkInDate } },
      ],
    },
  });
  if (conflict) {
    res.status(409).json({ error: "Booking conflict: listing is not available for the selected dates" });
    return;
  }

  // Calculate total automatically: pricePerNight × number of nights
  const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = days * listing.pricePerNight;

  const newBooking = await prisma.booking.create({
    data: {
      guestId: guestId,
      listingId: listingIdStr,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'PENDING',
    },
  });

  try {
    const guest = await prisma.user.findUnique({ where: { id: guestId } });
    if (guest) {
      const checkInStr = formatDate(checkInDate);
      const checkOutStr = formatDate(checkOutDate);
      await sendEmail(
        guest.email,
        "Booking Confirmed",
        bookingConfirmationEmail(
          guest.name,
          listing.title,
          listing.location,
          checkInStr,
          checkOutStr,
          totalPrice
        )
      );
    }
  } catch (emailErr) {
    console.error("Failed to send booking confirmation email:", emailErr);
  }

  // Return 201 with the created booking
  res.status(201).json(newBooking);
};

// GET /bookings - Paginated with Promise.all
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  // Use Promise.all to fetch bookings and count in parallel
  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: {
          select: { name: true },
        },
        listing: {
          select: { title: true, location: true },
        },
      },
    }),
    prisma.booking.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    data: bookings,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  });
};

// GET /bookings/:id - Get single booking with full details
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id as string;
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { 
      guest: true, 
      listing: true 
    },
  });
  if (!booking) {
    // Return 404 if not found
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
};

// GET /users/:id/bookings - Get all bookings for a specific user (paginated)
export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  const userId: string = req.params.id as string;
  
  if (!userId) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  // Return 404 if the user doesn't exist
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  // Use Promise.all to fetch bookings and count in parallel
  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: { guestId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: { title: true, location: true },
        },
      },
    }),
    prisma.booking.count({
      where: { guestId: userId },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    data: bookings,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  });
};

// DELETE /bookings/:id - Delete a booking
export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const id: string = req.params.id as string;
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    // Return 404 if not found
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  
  if (booking.guestId !== req.userId) {
    res.status(403).json({ error: "You can only cancel your own bookings" });
    return;
  }
  if (booking.status === "CANCELLED") {
    res.status(400).json({ error: "Booking is already cancelled" });
    return;
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  // Return 200 with a success message
  res.status(200).json({ message: "Booking cancelled successfully" });
};
