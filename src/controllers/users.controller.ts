import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient( {
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

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

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id || '', 10);
    if (isNaN(id)) {
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

    res.json(user);
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
      role?: string;
      avatar?: string;
      bio?: string;
    };

    if (!body.name || !body.email || !body.username || !body.phone) {
      res.status(400).json({ error: 'Missing required fields: name, email, username, phone' });
      return;
    }

    const userData: any = {
      name: body.name,
      email: body.email,
      username: body.username,
      phone: body.phone,
    };

    if (body.role !== undefined) userData.role = body.role;
    if (body.avatar !== undefined) userData.avatar = body.avatar;
    if (body.bio !== undefined) userData.bio = body.bio;

    const user = await prisma.user.create({
      data: userData,
    });

    res.status(201).json(user);
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
    const id = parseInt(req.params.id || "", 10);
    if (isNaN(id)) {
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

    res.json(user);
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
    const id = parseInt(req.params.id || '', 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

