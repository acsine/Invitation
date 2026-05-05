const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // --- Create Plans ---
  const plans = [
    {
      name: 'Gratuit',
      price: 0,
      maxEvents: 1,
      maxGuests: 50,
      features: JSON.stringify(['1 Événement', '50 Invités maximum', 'Support basique']),
    },
    {
      name: 'Premium',
      price: 10000,
      maxEvents: 9999,
      maxGuests: 9999,
      features: JSON.stringify(['Événements illimités', 'Badges HD illimités', 'Support prioritaire 24/7', 'Statistiques détaillées']),
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({ data: plan });
      console.log(`Plan ${plan.name} créé`);
    }
  }

  // --- Create Super Admin ---
  const bcrypt = require('bcryptjs');
  const adminEmail = 'admin@invitemanager.com';
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Super Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Compte Super Admin créé : admin@invitemanager.com / Admin123!');
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
