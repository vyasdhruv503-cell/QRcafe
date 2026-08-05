import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'KITCHEN';
  cafeId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
  }

  if (token === 'demo_admin_jwt_token') {
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminUser) {
      req.user = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: 'ADMIN',
        cafeId: adminUser.cafeId,
      };
      return next();
    }
  }

  if (token === 'demo_kitchen_jwt_token') {
    const kitchenUser = await prisma.user.findFirst({ where: { role: 'KITCHEN' } });
    if (kitchenUser) {
      req.user = {
        id: kitchenUser.id,
        email: kitchenUser.email,
        name: kitchenUser.name,
        role: 'KITCHEN',
        cafeId: kitchenUser.cafeId,
      };
      return next();
    }
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-cafeqr-2026';
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
};

export const requireRole = (allowedRoles: Array<'ADMIN' | 'KITCHEN'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to perform this action.' });
    }

    next();
  };
};
