import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL environment variable is missing. Prisma Client will rely on loaded environment settings.');
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
