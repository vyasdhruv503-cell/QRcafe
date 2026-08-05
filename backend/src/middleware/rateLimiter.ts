import rateLimit from 'express-rate-limit';

export const publicOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 order creations per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many order attempts from this connection. Please wait a few minutes before trying again.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});
