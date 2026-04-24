import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import bcrypt from "bcrypt";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

export async function register(req: Request, res: Response) {
  const { name, email, username, password, role , phone} = req.body;

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

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existingUser) {
    return res.status(409).json({ error: "Email or username already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
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
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions,
  );
  const {password:_, ...userWithoutPassword} = user;
  res.json({token, user: userWithoutPassword});
}

export async function getMe (req: AuthRequest, res: Response) {
    const user = await prisma.user.findUnique({
        where: {id: req.userId!},
        include: {
            listings: req.role!  === "HOST" || req.role! === "ADMIN"
        },
    });
    if (!user) {
    return res.status(404).json({ error: "User not found" });
    };

    const {password:_, ...userWithoutPassword} = user;
    res.json(userWithoutPassword);
}
export async function changePassword(req: AuthRequest, res: Response) {
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({error: "Current and new password are required"});

    }
    if (newPassword.length < 8) {
        return res.status(400).json({error: "New password must be at least 8 characters long"});
    }

    const user = await prisma.user.findUnique({
        where: {id: req.userId!}
    });
    if (!user) {
        return res.status(404).json({error: "User not found"})
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        return res.status(401).json({error: "Current password is incorrect"});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: {id: req.userId!},
        data: {password: hashedPassword}
    })
    res.json({message: "Password changed successfully"});
}
export async function forgotPassword(req: Request, res: Response) {
    const {email} = req.body;

    if (!email) {
        return res.status(400).json({error: "Email is required"});

    }
    const successrResponse = {message: "If an account with that email exists, a password reset link has been sent"};

    const user = await prisma.user.findUnique({
        where : {email}
    });

    if (!user) {
        return res.json(successrResponse)
    };

   
    const rawToken = new Uint32Array(32)
    crypto.getRandomValues(rawToken);
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: {id: user.id},
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }
    })
    console.log(`Reset token for ${email}: ${rawToken}`);

    res.json(successrResponse)
}

export async function resetPassword (req: Request, res: Response) {
  const {token} = req.params;
  const {password} = req.body;
  if (!token || password.length < 8) {
    return res.status(400).json({error: "Password must be at least 8 characters long"});

  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user =  await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: {gt: new Date()},
    },
  })

  if (!user) {
    return res.status(400).json({error: "Invalid or expired token"});
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: {id: user.id},
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    }
  })
  res.json({message: "Password reset successful"});
}