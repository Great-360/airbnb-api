import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    userId?: number;
    role?: string;
}

export async function  authentication(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];

    if(!authHeader?.startsWith("Bearer")) {
        return res.status(401).json({error: "No token provided"});
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({error: "No token provided"});
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId:number, role: string};
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    
    } catch (err) {
        return res.status(401).json({error: "Invalid token"});
    }
}

export function requireGuest(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.role !== "GUEST") {
        return res.status(403).json({error: "Access denied"});
    }
    next();
}
export function requireHost(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.role !== "HOST") {
        return res.status(403).json({error: "Access denied"});
    }
    next();
}
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.role !== "ADMIN") {
        return res.status(403).json({error: "Access denied"});
    }
    next();
}