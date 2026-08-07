const { execSync } = require('child_process');

const SUPABASE_DB_URL = "postgresql://postgres.snurrwdzxifjjtpzqvin:QRcafe123dv@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  dbUrl = SUPABASE_DB_URL;
}

console.log('🚀 Prisma Deploy Script starting...');
console.log('📡 Using PostgreSQL Database host:', dbUrl.split('@')[1] || 'Supabase');

const envVars = { ...process.env, DATABASE_URL: dbUrl };

try {
  console.log('1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit', env: envVars });

  console.log('2️⃣ Pushing schema to Supabase PostgreSQL...');
  execSync('npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss', { stdio: 'inherit', env: envVars });

  console.log('3️⃣ Seeding database...');
  execSync('node prisma/seed.js', { stdio: 'inherit', env: envVars });

  console.log('✨ Prisma deployment completed successfully!');
} catch (err) {
  console.error('❌ Prisma deployment script step failed:', err.message);
  process.exit(1);
}
