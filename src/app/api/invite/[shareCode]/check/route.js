import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { shareCode } = await params;
    const { searchParams } = new URL(request.url);
    const value = searchParams.get('value');

    if (!value) {
      return NextResponse.json({ error: 'Valeur manquante' }, { status: 400 });
    }

    const events = await prisma.$queryRawUnsafe(
      `SELECT id, "uniquenessField" FROM "Event" WHERE "shareCode" = $1`,
      shareCode
    );
    const event = events[0];

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const trimmedValue = String(value).trim();

    // 1. Exact match by eventId_phone
    let existingGuest = await prisma.guest.findUnique({
      where: {
        eventId_phone: {
          eventId: event.id,
          phone: trimmedValue
        }
      }
    });

    // 2. Normalized digits match
    if (!existingGuest) {
      const cleanVal = trimmedValue.replace(/[^\d]/g, '');
      if (cleanVal.length >= 8) {
        const guests = await prisma.guest.findMany({
          where: { eventId: event.id },
          select: { id: true, name: true, phone: true, generatedImageUrl: true }
        });

        existingGuest = guests.find(g => {
          if (!g.phone) return false;
          const gClean = g.phone.replace(/[^\d]/g, '');
          return gClean === cleanVal || (gClean.length >= 8 && gClean.slice(-8) === cleanVal.slice(-8));
        });
      }
    }

    return NextResponse.json({
      exists: !!existingGuest,
      guest: existingGuest ? {
        id: existingGuest.id,
        name: existingGuest.name,
        generatedImageUrl: existingGuest.generatedImageUrl
      } : null
    });

  } catch (error) {
    console.error('Check uniqueness error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
