import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(' [Error Middleware]', err.message || err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      error: `Validation Error: ${formattedErrors}`,
      details: err.errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isPublic ? err.message : 'An internal server error occurred. Please try again later.';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
};
