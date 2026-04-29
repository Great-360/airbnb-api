"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_js_1 = require("../config/email.js");
const emails_js_1 = require("../templates/emails.js");
async function register(req, res) {
    const { name, email, username, password, role, phone } = req.body;
    if (!name || !email || !password || !username || !phone) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 8) {
        return res
            .status(400)
            .json({ error: "Password must be at least 8 characters long" });
    }
    if (role && role !== "HOST" && role !== "GUEST") {
        return res.status(400).json({ error: "Role must be HOST or GUEST" });
    }
    const existingUser = await prisma_js_1.default.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
        return res.status(409).json({ error: "Email or username already in use" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_js_1.default.user.create({
        data: {
            email,
            name,
            phone,
            username,
            password: hashedPassword,
            role: role ?? "GUEST",
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
    await (0, email_js_1.sendEmail)(email, "Welcome to Airbnb", (0, emails_js_1.welcomeEmail)(name, role ?? 'GUEST'));
    console.log("Welcome email sent");
}
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await prisma_js_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
}
async function getMe(req, res) {
    const user = await prisma_js_1.default.user.findUnique({
        where: { id: req.userId },
        include: {
            listings: req.role === "HOST" || req.role === "ADMIN"
        },
    });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    ;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
}
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }
    const user = await prisma_js_1.default.user.findUnique({
        where: { id: req.userId }
    });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_js_1.default.user.update({
        where: { id: req.userId },
        data: { password: hashedPassword }
    });
    res.json({ message: "Password changed successfully" });
}
async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    const successrResponse = { message: "If an account with that email exists, a password reset link has been sent" };
    const user = await prisma_js_1.default.user.findUnique({
        where: { email }
    });
    if (!user) {
        return res.json(successrResponse);
    }
    ;
    const rawToken = new Uint32Array(32);
    crypto_1.default.getRandomValues(rawToken);
    const hashedToken = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    await prisma_js_1.default.user.update({
        where: { id: user.id },
        data: {
            resetToken: hashedToken,
            resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
    });
    console.log(`Reset token for ${email}: ${rawToken}`);
    res.json(successrResponse);
    await (0, email_js_1.sendEmail)(email, "Password Reset", `<p>Click the link below to reset your password:</p>
        <a href="http://localhost:3000/reset-password/${hashedToken}" style="background-color: #FF5A5F; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>`);
    console.log(`Email sent to ${email}`);
}
async function resetPassword(req, res) {
    let tokenParam = req.params.token;
    const { password } = req.body;
    let tokenStr;
    if (typeof tokenParam === 'string') {
        tokenStr = tokenParam;
    }
    else if (Array.isArray(tokenParam) && tokenParam.length > 0 && typeof tokenParam[0] === 'string') {
        tokenStr = tokenParam[0];
    }
    else {
        return res.status(400).json({ error: "Invalid token" });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    const hashedToken = crypto_1.default.createHash("sha256").update(tokenStr).digest("hex");
    const user = await prisma_js_1.default.user.findFirst({
        where: {
            resetToken: hashedToken,
            resetTokenExpiry: { gt: new Date() },
        },
    });
    if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await prisma_js_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        }
    });
    res.json({ message: "Password reset successful" });
    await (0, email_js_1.sendEmail)(user.email, "Password Reset Confirmation", (0, emails_js_1.passwordResetEmail)(user.name, `http://localhost:3000/reset-password/${tokenStr}`));
    console.log("Password reset email sent");
}
//# sourceMappingURL=auth.controller.js.map