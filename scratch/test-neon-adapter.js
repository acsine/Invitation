const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function testAdapter() {
  const dbUrl = "postgresql://neondb_owner:npg_USxT0fLt6Eqp@ep-damp-poetry-apywl4a9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";
  try {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });
    
    console.log('Testing Prisma with Neon Adapter...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Prisma Adapter Success! Users:', users);
    await prisma.$disconnect();
  } catch (err) {
    console.error('Prisma Adapter Error:', err.message);
  }
}

testAdapter();
