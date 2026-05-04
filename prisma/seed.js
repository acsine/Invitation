const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Starter',
      price: 0,
      maxEvents: 1,
      maxGuests: 10,
      features: JSON.stringify(['Affiches gratuites', 'Badges basiques']),
    },
    {
      name: 'Pro',
      price: 5000,
      maxEvents: 10,
      maxGuests: 100,
      features: JSON.stringify(['Affiches payantes', 'Badges personnalisés', 'Export PDF']),
    },
    {
      name: 'Business',
      price: 15000,
      maxEvents: 100,
      maxGuests: 1000,
      features: JSON.stringify(['Support prioritaire', 'Multi-utilisateurs', 'Statistiques avancées']),
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({
        data: {
          name: plan.name,
          price: plan.price,
          maxEvents: plan.maxEvents,
          maxGuests: plan.maxGuests,
          features: plan.features,
        },
      });
    }
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
