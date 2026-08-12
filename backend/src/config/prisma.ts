import { PrismaClient } from '@prisma/client';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.snurrwdzxifjjtpzqvin:QRcafe123dv@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
