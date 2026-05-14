
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'Secretariat@invitemanager.com' },
  });
  console.log(user ? 'User exists' : 'User NOT found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
