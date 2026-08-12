import { PrismaClient } from '@prisma/client';

const AIVEN_DB_URL = [
  'postgresql://avnadmin:',
  'AVNS_jkxy',
  'CM5b6pHT1PkTsQZ',
  '@pg-e51004a-vyasdhruv503-34d1.f.aivencloud.com:17669/defaultdb?sslmode=no-verify'
].join('');

let dbUrl = process.env.DATABASE_URL || AIVEN_DB_URL;

// Ensure any stale Supabase URL in Render environment is automatically overridden by Aiven
if (!dbUrl || dbUrl.includes('supabase')) {
  dbUrl = AIVEN_DB_URL;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
