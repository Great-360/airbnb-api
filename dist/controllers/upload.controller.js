import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { PrismaClient } from "@prisma/client/extension";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});
export async function uploadAvatar(req, res) {
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    if (req.userId !== id) {
        return res.status(403).json({ error: "Forbidden: you can only update your own avatar" });
    }
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");
    const updated = await prisma.user.update({
        where: { id },
        data: { avatar: url, avatarPublicId: publicId },
    });
    const { password, ...userWithoutPassword } = updated;
    return res.json(userWithoutPassword);
}
export async function deleteAvatar(req, res) {
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    if (req.userId !== id) {
        return res.status(403).json({ error: "Forbidden: you can only delete your own avatar" });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (!user.avatar) {
        return res.status(400).json({ error: "No avatar to remove" });
    }
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }
    await prisma.user.update({
        where: { id },
        data: { avatar: null, avatarPublicId: null },
    });
    return res.json({ message: "Avatar deleted successfully" });
}
export async function uploadListingPhotos(req, res) {
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid listing ID" });
    }
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.hostId !== req.userId) {
        return res.status(403).json({ error: "Forbidden: you can only upload photos to your own listings" });
    }
    const existingCount = await prisma.listingPhoto.count({ where: { listingId: id } });
    if (existingCount >= 5) {
        return res.status(400).json({ error: "Maximum of 5 photos allowed per listing" });
    }
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }
    const remainingSlots = 5 - existingCount;
    const filesToProcess = files.slice(0, remainingSlots);
    for (const file of filesToProcess) {
        const { url, publicId } = await uploadToCloudinary(file.buffer, "airbnb/listings");
        await prisma.listingPhoto.create({
            data: {
                url,
                publicId,
                listingId: id,
            },
        });
    }
    const updatedListing = await prisma.listing.findUnique({
        where: { id },
        include: { photos: true },
    });
    return res.json(updatedListing);
}
export async function deleteListingPhoto(req, res) {
    const id = parseInt(req.params.id || "", 10);
    const photoId = parseInt(req.params.photoId || "", 10);
    if (isNaN(id) || isNaN(photoId)) {
        return res.status(400).json({ error: "Invalid listing or photo ID" });
    }
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.hostId !== req.userId) {
        return res.status(403).json({ error: "Forbidden: you can only delete photos from your own listings" });
    }
    const photo = await prisma.listingPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
    }
    if (photo.listingId !== id) {
        return res.status(403).json({ error: "Forbidden: photo does not belong to this listing" });
    }
    await deleteFromCloudinary(photo.publicId);
    await prisma.listingPhoto.delete({ where: { id: photoId } });
    return res.json({ message: "Photo deleted successfully" });
}
//# sourceMappingURL=upload.controller.js.map