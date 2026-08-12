import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

const MAX_MSG_LENGTH = 500;

function safeErrMessage(err: any): string {
  try {
    if (typeof err === 'string') return err.slice(0, MAX_MSG_LENGTH);

    if (err?.code && typeof err.code === 'string') {
      const base = `[${err.code}]`;
      const detail = typeof err.message === 'string' && err.message.length < MAX_MSG_LENGTH
        ? ` ${err.message}`
        : '';
      return base + detail;
    }

    if (typeof err?.message === 'string' && err.message.length < MAX_MSG_LENGTH) {
      return err.message;
    }

    if (err?.name) return `${err.name} (message too large to display)`;
    return 'Unknown server error';
  } catch {
    return 'UnknownError';
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const errMsg = safeErrMessage(err);
  console.error(`🚨 [Error Middleware] ${req.method} ${req.originalUrl} [${timestamp}]: ${errMsg}`);

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      error: `Validation Error: ${formattedErrors}`,
      details: err.errors,
    });
  }

  // 2. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({ error: `A record with this ${target} already exists.` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid reference or missing relation.' });
    }
    return res.status(500).json({ error: `Database error [${err.code}]: ${err.message?.slice(0, 200)}` });
  }

  // 3. Prisma Initialization / Connection Errors
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    console.error('🔴 Prisma engine failed to initialize:', err.message?.slice(0, 300));
    return res.status(503).json({ error: `Database Init Error: ${err.message?.slice(0, 300)}` });
  }

  // 4. General HTTP Errors
  const statusCode = err.statusCode || err.status || 500;
  const message =
    typeof err.message === 'string' && err.message.length < MAX_MSG_LENGTH
      ? err.message
      : 'An internal server error occurred. Please try again later.';

  res.status(statusCode).json({ error: message });
};
