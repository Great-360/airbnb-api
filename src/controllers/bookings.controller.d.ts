import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
export declare const getAllBookings: (req: Request, res: Response) => Promise<void>;
export declare const getBookingById: (req: Request, res: Response) => Promise<void>;
export declare const createBooking: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBooking: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=bookings.controller.d.ts.map