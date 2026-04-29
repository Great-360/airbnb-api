"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_js_1.default.user.findMany({
            include: {
                _count: {
                    select: {
                        listings: true,
                    },
                },
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const paramId = req.params.id;
        const id = parseInt(paramId || '', 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }
        const user = await prisma_js_1.default.user.findUnique({
            where: { id },
            include: {
                listings: true,
                bookings: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const body = req.body;
        if (!body.name || !body.email || !body.username || !body.phone || !body.password) {
            res.status(400).json({ error: 'Missing required fields: name, email, username, phone, password' });
            return;
        }
        const existingUser = await prisma_js_1.default.user.findFirst({
            where: { OR: [{ email: body.email }, { username: body.username }] },
        });
        if (existingUser) {
            res.status(409).json({ error: 'Email or username already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(body.password, 10);
        const userData = {
            name: body.name,
            email: body.email,
            username: body.username,
            phone: body.phone,
            password: hashedPassword,
        };
        if (body.role !== undefined)
            userData.role = body.role;
        if (body.avatar !== undefined)
            userData.avatar = body.avatar;
        if (body.bio !== undefined)
            userData.bio = body.bio;
        const user = await prisma_js_1.default.user.create({
            data: userData,
        });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Email or username already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const paramId = req.params.id;
        const id = parseInt(paramId || '', 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }
        const existingUser = await prisma_js_1.default.user.findUnique({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const body = req.body;
        const updateData = {};
        if (body.name !== undefined)
            updateData.name = body.name;
        if (body.email !== undefined)
            updateData.email = body.email;
        if (body.username !== undefined)
            updateData.username = body.username;
        if (body.phone !== undefined)
            updateData.phone = body.phone;
        if (body.role !== undefined)
            updateData.role = body.role;
        if (body.avatar !== undefined)
            updateData.avatar = body.avatar;
        if (body.bio !== undefined)
            updateData.bio = body.bio;
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        const user = await prisma_js_1.default.user.update({
            where: { id },
            data: updateData,
        });
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Email or username already exists' });
            return;
        }
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const paramId = req.params.id;
        const id = parseInt(paramId || '', 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid ID' });
            return;
        }
        const existingUser = await prisma_js_1.default.user.findUnique({ where: { id } });
        if (!existingUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await prisma_js_1.default.user.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=users.controller.js.map