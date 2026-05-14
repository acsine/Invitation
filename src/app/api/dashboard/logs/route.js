import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get all staff members for this organizer
    const staff = await prisma.user.findMany({
      where: { parentId: session.user.id },
      select: { id: true }
    });

    const staffIds = staff.map(s => s.id);

    // Get logs for the organizer themselves and their staff
    const logs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: { in: staffIds } }
        ]
      },
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Last 100 logs
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
