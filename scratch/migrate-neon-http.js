const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const dbUrl = "postgresql://neondb_owner:npg_USxT0fLt6Eqp@ep-damp-poetry-apywl4a9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function runMigration() {
  const sql = neon(dbUrl);
  console.log('Running SQL Migration on Neon Database over HTTPS (Port 443)...');

  try {
    // 1. User
    await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ORGANIZER',
        "parentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table User créée');

    // 2. Plan
    await sql`
      CREATE TABLE IF NOT EXISTS "Plan" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "maxEvents" INTEGER NOT NULL,
        "maxGuests" INTEGER NOT NULL,
        "features" TEXT NOT NULL DEFAULT '[]'
      );
    `;
    console.log('✓ Table Plan créée');

    // 3. Subscription
    await sql`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "planId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3) NOT NULL
      );
    `;
    console.log('✓ Table Subscription créée');

    // 4. Event
    await sql`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "backgroundImageUrl" TEXT,
        "zones" TEXT NOT NULL DEFAULT '[]',
        "isPaid" BOOLEAN NOT NULL DEFAULT false,
        "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "paymentMethod" TEXT,
        "paymentNumber" TEXT,
        "shareCode" TEXT NOT NULL UNIQUE,
        "customFields" TEXT NOT NULL DEFAULT '[]',
        "uniquenessField" TEXT NOT NULL DEFAULT 'phone',
        "attendanceDays" INTEGER NOT NULL DEFAULT 1,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "sessionsPerDay" INTEGER NOT NULL DEFAULT 1,
        "sessionConfig" TEXT NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table Event créée');

    // 5. Guest
    await sql`
      CREATE TABLE IF NOT EXISTS "Guest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "eventId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "photoUrl" TEXT,
        "generatedImageUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "transactionRef" TEXT,
        "additionalData" TEXT NOT NULL DEFAULT '{}',
        "attendance" TEXT NOT NULL DEFAULT '{}',
        "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table Guest créée');

    // 6. BadgeTemplate
    await sql`
      CREATE TABLE IF NOT EXISTS "BadgeTemplate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "eventId" TEXT NOT NULL UNIQUE,
        "backgroundImageUrl" TEXT,
        "zones" TEXT NOT NULL DEFAULT '[]',
        "width" DOUBLE PRECISION NOT NULL DEFAULT 85,
        "height" DOUBLE PRECISION NOT NULL DEFAULT 54,
        "title" TEXT NOT NULL DEFAULT 'Invité'
      );
    `;
    console.log('✓ Table BadgeTemplate créée');

    // 7. Payment
    await sql`
      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "guestId" TEXT NOT NULL UNIQUE,
        "eventId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "commission" DOUBLE PRECISION NOT NULL,
        "netAmount" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "transactionRef" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table Payment créée');

    // 8. WithdrawalRequest
    await sql`
      CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "mobileNumber" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table WithdrawalRequest créée');

    // 9. support_tickets
    await sql`
      CREATE TABLE IF NOT EXISTS "support_tickets" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "adminReply" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table support_tickets créée');

    // 10. activity_logs
    await sql`
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "details" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✓ Table activity_logs créée');

    // Seed Plans & Admin User
    const plans = [
      { name: 'Gratuit', price: 0, maxEvents: 1, maxGuests: 50, features: JSON.stringify(['1 Événement', '50 Invités maximum', 'Support basique']) },
      { name: 'Premium', price: 10000, maxEvents: 9999, maxGuests: 9999, features: JSON.stringify(['Événements illimités', 'Badges HD illimités', 'Support prioritaire 24/7', 'Statistiques détaillées']) }
    ];

    for (const plan of plans) {
      const existing = await sql`SELECT id FROM "Plan" WHERE name = ${plan.name}`;
      if (existing.length === 0) {
        const id = require('crypto').randomUUID();
        await sql`INSERT INTO "Plan" (id, name, price, "maxEvents", "maxGuests", features) VALUES (${id}, ${plan.name}, ${plan.price}, ${plan.maxEvents}, ${plan.maxGuests}, ${plan.features})`;
        console.log(`✓ Plan ${plan.name} inséré.`);
      }
    }

    const adminEmail = 'admin@invitemanager.com';
    const existingAdmin = await sql`SELECT id FROM "User" WHERE email = ${adminEmail}`;
    if (existingAdmin.length === 0) {
      const id = require('crypto').randomUUID();
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const now = new Date();
      await sql`INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") VALUES (${id}, ${adminEmail}, 'Super Admin', ${hashedPassword}, 'ADMIN', ${now}, ${now})`;
      console.log('✓ Compte Super Admin créé sur Neon : admin@invitemanager.com / Admin123!');
    }

    console.log('\n🎉 TOUTES LES TABLES ET LE SEED NEON ONT ÉTÉ CRÉÉS AVEC SUCCÈS !');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

runMigration();
