const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const dbUrl = "postgresql://neondb_owner:npg_USxT0fLt6Eqp@ep-damp-poetry-apywl4a9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function seedNeon() {
  const sql = neon(dbUrl);
  console.log('Seeding Neon database over HTTPS (Port 443)...');
  
  try {
    // 1. Create Plans if not exists
    const plans = [
      { name: 'Gratuit', price: 0, maxEvents: 1, maxGuests: 50, features: JSON.stringify(['1 Événement', '50 Invités maximum', 'Support basique']) },
      { name: 'Premium', price: 10000, maxEvents: 9999, maxGuests: 9999, features: JSON.stringify(['Événements illimités', 'Badges HD illimités', 'Support prioritaire 24/7', 'Statistiques détaillées']) }
    ];

    for (const plan of plans) {
      const existing = await sql`SELECT id FROM "Plan" WHERE name = ${plan.name}`;
      if (existing.length === 0) {
        const id = require('crypto').randomUUID();
        await sql`INSERT INTO "Plan" (id, name, price, "maxEvents", "maxGuests", features) VALUES (${id}, ${plan.name}, ${plan.price}, ${plan.maxEvents}, ${plan.maxGuests}, ${plan.features})`;
        console.log(`Plan ${plan.name} créé sur Neon.`);
      }
    }

    // 2. Create Super Admin if not exists
    const adminEmail = 'admin@invitemanager.com';
    const existingAdmin = await sql`SELECT id FROM "User" WHERE email = ${adminEmail}`;
    
    if (existingAdmin.length === 0) {
      const id = require('crypto').randomUUID();
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const now = new Date();
      await sql`INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") VALUES (${id}, ${adminEmail}, 'Super Admin', ${hashedPassword}, 'ADMIN', ${now}, ${now})`;
      console.log('Compte Super Admin créé sur Neon : admin@invitemanager.com / Admin123!');
    } else {
      console.log('Compte Super Admin existe déjà sur Neon.');
    }

    console.log('Seed Neon terminé avec succès!');
  } catch (err) {
    console.error('Seed Neon error:', err.message);
  }
}

seedNeon();
