import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const publicOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 30,   // No effective limit in dev; 30 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order attempts from this connection. Please wait a few minutes before trying again.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 20,   // No effective limit in dev; 20 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});
