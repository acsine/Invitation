import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let targetUserId = session.user.id;

    if (session.user.role === 'STAFF') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { parentId: true }
      });
      if (user?.parentId) {
        targetUserId = user.parentId;
      }
    }

    const events = await prisma.event.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        sessionsPerDay: true,
        sessionConfig: true,
        attendanceDays: true,
        customFields: true,
        uniquenessField: true
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Fetch scan events error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
