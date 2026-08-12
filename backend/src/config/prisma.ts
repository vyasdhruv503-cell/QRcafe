import { PrismaClient } from '@prisma/client';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.snurrwdzxifjjtpzqvin:QRcafe123dv@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

// Do NOT add log: ['error'] here — Prisma's own error logger dumps its entire
// minified runtime bundle into the console when the query engine panics.
// All errors are handled and logged by our custom errorHandler middleware.
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});
