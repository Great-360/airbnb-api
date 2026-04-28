import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
export declare const getAllListings: (req: Request, res: Response) => Promise<void>;
export declare const getListingById: (req: Request, res: Response) => Promise<void>;
export declare const createListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateListing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteListing: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=listings.controller.d.ts.map