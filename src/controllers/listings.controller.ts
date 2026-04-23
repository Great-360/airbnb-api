import { Request, Response } from "express";
import { Listing, listings } from "../models/listings.model.js";

export const getAllListings = (req: Request, res: Response): void => {
    res.json(listings);

};

export const getListingById = (req: Request, res: Response): void => {
    const idStr = req.params.id;
    if (!idStr || typeof idStr !== 'string') {
        res.status(400).json({error: "Invalid id"});
        return;
    }
    const id = parseInt(idStr);
    const listing = listings.find(listing => listing.id === id);
     
    if (!listing) {
        res.status(404).json({error: "Listing not found"});
        return;
    }

    res.json(listing);
};

export const createListing = (req: Request, res: Response): void => {
    const { title, description, price, location, category, imageUrl, userId} = req.body;

    if ( !title || !description || !price || !location || !category || !imageUrl || !userId) {
        res.status(400).json({error: "Missing required fields"});
        return
    }
    const newListing:Listing = {
        id: listings.length + 1,
        title,
        description,
        price:Math.abs(price),
        location,
        category,
        imageUrl,
        userId
    };
    listings.push(newListing);

    res.status(201).json(newListing)


};

export const updateListing = (req: Request, res: Response): void => {
    const idStr = req.params.id;
    if (!idStr || typeof idStr !== 'string') {
        res.status(400).json({error: "Invalid id"});
        return;
    }
    const id = parseInt(idStr);
    const listing = listings.find(listing => listing.id === id);

    if (!listing) {
        res.status(404).json({error: "Listing not found"});
        return;
    }
    const { title, description, price, location, category, imageUrl } = req.body;
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = price;
    if (location) listing.location = location;
    if (category) listing.category = category;
    if (imageUrl) listing.imageUrl = imageUrl;

    res.json(listing);
}

export const deleteListing = (req: Request, res: Response): void => {
    const idStr = req.params.id;
    if (!idStr || typeof idStr !== 'string') {
        res.status(400).json({error: "Invalid id"});
        return;
    }
    const id = parseInt(idStr);
    const listingIndex = listings.findIndex(listing => listing.id === id);

    if(listingIndex === -1) {
        res.status(404).json({error: "Listing not found"});
        return;
    }
    const deletedListing = listings.splice(listingIndex, 1);

    res.json({message: "Listing deleted successfully", listing: deletedListing[0]})
} 