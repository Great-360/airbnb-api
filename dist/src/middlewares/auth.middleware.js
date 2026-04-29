import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
export async function authentication(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer")) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
export function requireGuest(req, res, next) {
    if (req.role !== "GUEST") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
export function requireHost(req, res, next) {
    if (req.role !== "HOST") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
export function requireAdmin(req, res, next) {
    if (req.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map