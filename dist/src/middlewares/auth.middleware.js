"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = authentication;
exports.requireGuest = requireGuest;
exports.requireHost = requireHost;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
async function authentication(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer")) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
function requireGuest(req, res, next) {
    if (req.role !== "GUEST") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
function requireHost(req, res, next) {
    if (req.role !== "HOST") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
function requireAdmin(req, res, next) {
    if (req.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map