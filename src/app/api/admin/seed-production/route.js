import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Create Plans
    const plans = [
      { 
        name: 'Gratuit', 
        price: 0, 
        maxEvents: 1, 
        maxGuests: 50, 
        features: JSON.stringify(['1 Événement', '50 Invités maximum', 'Support basique']) 
      },
      { 
        name: 'Premium', 
        price: 10000, 
        maxEvents: 9999, 
        maxGuests: 9999, 
        features: JSON.stringify(['Événements illimités', 'Badges HD illimités', 'Support prioritaire 24/7', 'Statistiques détaillées']) 
      }
    ];

    for (const plan of plans) {
      // Find by name since IDs are auto-generated
      const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
      if (!existing) {
        await prisma.plan.create({ data: plan });
      }
    }

    // 2. Create Admin
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
    }

    return NextResponse.json({ 
      success: true,
      message: "Base de données de production initialisée !",
      credentials: {
        email: adminEmail,
        password: "Admin123!"
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: "Erreur d'initialisation : " + error.message }, { status: 500 });
  }
}
