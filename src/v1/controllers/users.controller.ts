import { Request, Response } from 'express';

import bcrypt from "bcrypt";

import prisma from "../config/prisma.js";
import { getCache, setCache, deleteCacheByPrefix } from "../config/cache.js";

const USERS_STATS_CACHE_KEY = "users:stats";
const CACHE_TTL_SECONDS = 300; // 5 minutes

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            listings: true,
          },
        },
      },
    });
res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUsersStats = async (req: Request, res: Response): Promise<void> => {
  // Check cache first
  const cached = await getCache<{
    totalUsers: number;
    byRole: { role: string; _count: { role: number } }[];
  }>(USERS_STATS_CACHE_KEY);

  if (cached) {
    res.json(cached);
    return;
  }

  // Execute all queries in parallel
  const [totalUsersResult, byRoleResult] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ]);

  const result = {
    totalUsers: totalUsersResult,
    byRole: byRoleResult.map((item) => ({
      role: item.role.toLowerCase(),
      _count: { role: item._count.role },
    })),
  };

  // Cache for 5 minutes
  await setCache(USERS_STATS_CACHE_KEY, result, CACHE_TTL_SECONDS);

  res.json(result);
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as {
      name: string;
      email: string;
      username: string;
      phone: string;
      password: string;
      role?: string;
      avatar?: string;
      bio?: string;
    };

    if (!body.name || !body.email || !body.username || !body.phone || !body.password) {
      res.status(400).json({ error: 'Missing required fields: name, email, username, phone, password' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Email or username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const userData: any = {
      name: body.name,
      email: body.email,
      username: body.username,
      phone: body.phone,
      password: hashedPassword,
    };

    if (body.role !== undefined) userData.role = body.role;
    if (body.avatar !== undefined) userData.avatar = body.avatar;
    if (body.bio !== undefined) userData.bio = body.bio;

const user = await prisma.user.create({
      data: userData,
    });

    // Clear users stats cache
    await deleteCacheByPrefix(USERS_STATS_CACHE_KEY);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email or username already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const body = req.body as {
      name?: string;
      email?: string;
      username?: string;
      phone?: string;
      role?: string;
      avatar?: string;
      bio?: string;
    };

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.bio !== undefined) updateData.bio = body.bio;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Clear users stats cache
    await deleteCacheByPrefix(USERS_STATS_CACHE_KEY);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email or username already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id: string = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

await prisma.user.delete({ where: { id } });

    // Clear users stats cache
    await deleteCacheByPrefix(USERS_STATS_CACHE_KEY);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
