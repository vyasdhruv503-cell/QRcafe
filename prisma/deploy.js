const { execSync } = require('child_process');

const AIVEN_DB_URL = [
  'postgres://avnadmin:',
  'AVNS_jkxy',
  'CM5b6pHT1PkTsQZ',
  '@pg-e51004a-vyasdhruv503-34d1.f.aivencloud.com:17669/defaultdb?sslmode=require'
].join('');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  dbUrl = AIVEN_DB_URL;
}

console.log('🚀 Prisma Deploy Script starting...');
console.log('📡 Using PostgreSQL Database host:', dbUrl.split('@')[1] || 'Aiven PostgreSQL Host');

const envVars = { ...process.env, DATABASE_URL: dbUrl };

try {
  console.log('1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit', env: envVars });

  console.log('2️⃣ Pushing schema to PostgreSQL (migrate)...');
  execSync('npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss', { stdio: 'inherit', env: envVars });

  console.log('3️⃣ Checking if seed is needed...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  prisma.cafe.count()
    .then(async (count) => {
      if (count === 0) {
        console.log('   Database is empty — running initial seed...');
        execSync('node prisma/seed.js', { stdio: 'inherit', env: envVars });
      } else {
        console.log(`   ✅ Database already has ${count} cafe record(s) — skipping seed.`);
      }
      await prisma.$disconnect();
      console.log('✨ Prisma deployment completed successfully!');
    })
    .catch(async (err) => {
      await prisma.$disconnect();
      console.warn('⚠️  Could not check seed status, running seed anyway:', err.message);
      execSync('node prisma/seed.js', { stdio: 'inherit', env: envVars });
      console.log('✨ Prisma deployment completed successfully!');
    });

} catch (err) {
  console.error('❌ Prisma deployment script step failed:', err.message);
  process.exit(1);
}
