import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Safe error message extractor — avoids serializing giant Prisma objects
 * that contain circular references or bundled client code.
 */
function safeErrMessage(err: any): string {
  if (typeof err === 'string') return err;
  if (err?.message && typeof err.message === 'string') return err.message;
  if (err?.code) return `Prisma/DB Error [${err.code}]`;
  try {
    return String(err?.name || 'UnknownError');
  } catch {
    return 'UnknownError';
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const errMsg = safeErrMessage(err);
  console.error(`🚨 [Error Middleware] ${req.method} ${req.originalUrl} [${timestamp}]: ${errMsg}`);
  if (err?.stack && process.env.NODE_ENV === 'development') {
    // Print only first 3 lines of stack trace — not the whole Prisma bundle
    console.error('  Stack:', err.stack.split('\n').slice(0, 3).join('\n  '));
  }

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
    // Generic Prisma error
    return res.status(500).json({
      error: `Database error: ${err.code}`,
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
  }

  // 3. Handle Prisma connection / initialization errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('🔴 Prisma cannot connect to the database. Check DATABASE_URL.');
    return res.status(503).json({
      error: 'Database connection failed. Please try again later.',
    });
  }

  // 4. General & Custom HTTP Errors
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An internal server error occurred. Please try again later.';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack?.split('\n').slice(0, 4).join('\n') }),
  });
};
