const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findUnique({
    where: { id: '12fa9084-038f-43fc-ab5a-ab2f4255953d' },
    select: { shareCode: true, name: true }
  });
  console.log('Event details:', event);
}

main().finally(() => prisma.$disconnect());
