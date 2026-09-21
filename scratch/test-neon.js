const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log('Connecting to Neon database...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', result);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
