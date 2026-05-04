import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const [usersCount, eventsCount, activeSubscriptions, recentUsers, recentEvents, payments] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.event.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        include: { user: { select: { name: true } }, _count: { select: { guests: true } } }
      }),
      prisma.payment.findMany({ where: { status: 'CONFIRMED' } })
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      usersCount,
      eventsCount,
      activeSubscriptions,
      totalRevenue,
      recentUsers,
      recentEvents
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
