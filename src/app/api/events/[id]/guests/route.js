import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    const guests = await prisma.guest.findMany({
      where: { eventId: id },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Fetch guests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { fieldName } = await request.json();

    if (!fieldName || fieldName === 'none') {
      return NextResponse.json({ error: 'Champ d\'unicité non spécifié' }, { status: 400 });
    }

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Find duplicates
    const guests = await prisma.guest.findMany({
      where: { eventId: id },
      orderBy: { submittedAt: 'asc' } // Keep the oldest entry
    });

    const seen = new Set();
    const toDelete = [];

    for (const guest of guests) {
      let val;
      if (fieldName === 'phone') {
        val = guest.phone;
      } else {
        try {
          const data = JSON.parse(guest.additionalData || '{}');
          val = data[fieldName];
        } catch (e) {
          val = null;
        }
      }

      if (!val) continue;

      const key = String(val).trim().toLowerCase();
      if (seen.has(key)) {
        toDelete.push(guest.id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      await prisma.guest.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: toDelete.length 
    });

  } catch (error) {
    console.error('Clean duplicates error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
