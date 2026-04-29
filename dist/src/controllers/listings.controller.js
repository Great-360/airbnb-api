"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListing = exports.updateListing = exports.createListing = exports.getListingById = exports.getAllListings = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const getAllListings = async (req, res) => {
    const listings = await prisma_js_1.default.listing.findMany({
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
exports.getAllListings = getAllListings;
const getListingById = async (req, res) => {
    const idStr = req.params.id;
    if (!idStr || isNaN(parseInt(idStr))) {
        res.status(400).json({ error: "Invalid id" });
        return;
    }
    const id = parseInt(idStr);
    const listing = await prisma_js_1.default.listing.findUnique({
        where: { id },
        include: { host: true, bookings: true },
    });
    if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
    }
    res.json(listing);
};
exports.getListingById = getListingById;
const createListing = async (req, res) => {
    const { title, description, pricePerNight, location, type, amenities, guests } = req.body;
    const hostId = req.userId;
    if (!title || !description || !pricePerNight || !location || !type || !hostId || guests == null) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const host = await prisma_js_1.default.user.findUnique({ where: { id: hostId } });
    if (!host) {
        res.status(404).json({ error: "Host not found" });
        return;
    }
    const newListing = await prisma_js_1.default.listing.create({
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
exports.createListing = createListing;
const updateListing = async (req, res) => {
    const idStr = req.params.id;
    if (!idStr || isNaN(parseInt(idStr))) {
        res.status(400).json({ error: "Invalid id" });
        return;
    }
    const id = parseInt(idStr);
    const listing = await prisma_js_1.default.listing.findUnique({ where: { id } });
    if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
    }
    if (listing.hostId !== req.userId && req.role !== "ADMIN") {
        res.status(403).json({ error: "You can only edit your own listings" });
        return;
    }
    const updatedListing = await prisma_js_1.default.listing.update({
        where: { id },
        data: req.body,
    });
    res.json(updatedListing);
};
exports.updateListing = updateListing;
const deleteListing = async (req, res) => {
    const idStr = req.params.id;
    if (!idStr || isNaN(parseInt(idStr))) {
        res.status(400).json({ error: "Invalid id" });
        return;
    }
    const id = parseInt(idStr);
    const listing = await prisma_js_1.default.listing.findUnique({ where: { id } });
    if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
    }
    if (listing.hostId !== req.userId && req.role !== "ADMIN") {
        res.status(403).json({ error: "You can only delete your own listings" });
        return;
    }
    const deletedListing = await prisma_js_1.default.listing.delete({ where: { id } });
    res.json({ message: "Listing deleted successfully", listing: deletedListing });
};
exports.deleteListing = deleteListing;
//# sourceMappingURL=listings.controller.js.map