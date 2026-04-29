import { PrismaClient } from "@prisma/client/extension";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendEmail } from "../config/email.js";
import { bookingConfirmationEmail, bookingCancellationEmail } from "../templates/emails.js";
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});
function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
export const getAllBookings = async (req, res) => {
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
export const getBookingById = async (req, res) => {
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
export const createBooking = async (req, res) => {
    const { listingId, checkIn, checkOut } = req.body;
    const guestId = req.userId;
    if (!listingId || !checkIn || !checkOut) {
        res.status(400).json({ error: "Missing required fields: listingId, checkIn, checkOut" });
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
    const listing = await prisma.listing.findUnique({ where: { id: Number(listingId) } });
    if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
    }
    const conflict = await prisma.booking.findFirst({
        where: {
            listingId: Number(listingId),
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
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * listing.pricePerNight;
    const newBooking = await prisma.booking.create({
        data: {
            guestId: guestId,
            listingId: Number(listingId),
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
            await sendEmail(guest.email, "Booking Confirmed", bookingConfirmationEmail(guest.name, listing.title, listing.location, checkInStr, checkOutStr, totalPrice));
        }
    }
    catch (emailErr) {
        console.error("Failed to send booking confirmation email:", emailErr);
    }
    res.status(201).json(newBooking);
};
export const deleteBooking = async (req, res) => {
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
    if (booking.guestId !== req.userId) {
        res.status(403).json({ error: "You can only cancel your own bookings" });
        return;
    }
    if (booking.status === "CANCELLED") {
        res.status(400).json({ error: "Booking is already cancelled" });
        return;
    }
    const cancelledBooking = await prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: { guest: true, listing: true },
    });
    try {
        const { guest, listing, checkIn, checkOut } = cancelledBooking;
        const checkInStr = formatDate(checkIn);
        const checkOutStr = formatDate(checkOut);
        await sendEmail(guest.email, "Booking Cancelled", bookingCancellationEmail(guest.name, listing.title, checkInStr, checkOutStr));
    }
    catch (emailErr) {
        console.error("Failed to send booking cancellation email:", emailErr);
    }
    res.json({ message: "Booking cancelled successfully", booking: cancelledBooking });
};
//# sourceMappingURL=bookings.controller.js.map