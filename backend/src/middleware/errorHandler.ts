import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.error(`🚨 [Error Middleware] ${req.method} ${req.originalUrl} [${timestamp}]:`, err.message || err);

  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      error: `Validation Error: ${formattedErrors}`,
      details: err.errors,
    });
  }

  // 2. Handle Prisma Known Database Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        error: `A record with this ${target} already exists.`,
        code: err.code,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'The requested database record was not found.',
        code: err.code,
      });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Database operation failed due to a missing relation or reference.',
        code: err.code,
      });
    }
  }

  // 3. General & Custom HTTP Errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred. Please try again later.';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
};
