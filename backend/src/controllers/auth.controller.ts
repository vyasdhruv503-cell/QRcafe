import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { loginSchema } from '../validators/auth.validator';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { cafe: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValidPassword = await bcrypt.compare(validated.password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-cafeqr-2026';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cafeId: user.cafeId,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiresIn as any });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cafeId: user.cafeId,
        cafeName: user.cafe.name,
        currency: user.cafe.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { cafe: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cafeId: user.cafeId,
        cafeName: user.cafe.name,
        currency: user.cafe.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};
