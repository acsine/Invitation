import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user.role === 'ADMIN';
}

export async function POST(request) {
  try {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    
    const { userId, planId } = await request.json();
    
    // Check if plan exists
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: 'Plan non trouvé' }, { status: 404 });

    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Update or Create subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate
      },
      create: {
        userId,
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Apply subscription error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
