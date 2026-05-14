import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, parentId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Determine the owner ID for events
    const ownerId = user.role === 'STAFF' ? user.parentId : userId;

    const events = await prisma.event.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { guests: true }
        }
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Mobile events error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
