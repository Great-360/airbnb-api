import type { Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import prisma from "../config/prisma.js";

function getParamAsNumber(paramName: string, params: ParamsDictionary): number {
    const paramValue = params[paramName];

    let paramStr: string;
    if (typeof paramValue === 'string') {
        paramStr = paramValue;
    } else if (Array.isArray(paramValue) && paramValue.length === 1) {
        paramStr = paramValue[0] as string;
    } else {
        throw new Error(`Invalid parameter: ${paramName}`);
    }

    const num = parseInt(paramStr, 10);
    if (isNaN(num)) {
        throw new Error(`Invalid numeric parameter: ${paramName}`);
    }
    return num;
}

export async function uploadAvatar(req: AuthRequest, res: Response) {
    const id = getParamAsNumber("id", req.params);

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

    const { url, publicId } = await uploadToCloudinary(
        req.file.buffer,
        "airbnb/avatars"
    );

    const updated = await prisma.user.update({
        where: { id },
        data: { avatar: url, avatarPublicId: publicId },
    });

    const { password, ...userWithoutPassword } = updated;
    return res.json(userWithoutPassword);
}

export async function deleteAvatar(req: AuthRequest, res: Response) {
    const id = getParamAsNumber("id", req.params);

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

export async function uploadListingPhotos(req: AuthRequest, res: Response) {
    const id = getParamAsNumber("id", req.params);

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

    const files = req.files as Express.Multer.File[] | undefined;
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

export async function deleteListingPhoto(req: AuthRequest, res: Response) {
    const id = getParamAsNumber("id", req.params);
    const photoId = getParamAsNumber("photoId", req.params);

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
