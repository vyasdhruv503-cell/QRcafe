import { PrismaClient } from '@prisma/client';

const AIVEN_DB_URL = [
  'postgresql://avnadmin:',
  'AVNS_jkxy',
  'CM5b6pHT1PkTsQZ',
  '@pg-e51004a-vyasdhruv503-34d1.f.aivencloud.com:17669/defaultdb?sslmode=require'
].join('');

let dbUrl = process.env.DATABASE_URL;

// Guarantee fallback to Aiven PostgreSQL if env var is missing or invalid
if (!dbUrl || !dbUrl.includes('aivencloud.com')) {
  dbUrl = AIVEN_DB_URL;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
