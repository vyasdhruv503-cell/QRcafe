import { PrismaClient } from '@prisma/client';

const AIVEN_DB_URL = [
  'postgresql://avnadmin:',
  'AVNS_jkxy',
  'CM5b6pHT1PkTsQZ',
  '@pg-e51004a-vyasdhruv503-34d1.f.aivencloud.com:17669/defaultdb?sslmode=require'
].join('');

let dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  dbUrl = dbUrl.trim().replace(/^["']|["']$/g, '');
}

// Ensure dbUrl starts with postgresql:// or postgres://, otherwise fallback to Aiven
if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  dbUrl = AIVEN_DB_URL;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
