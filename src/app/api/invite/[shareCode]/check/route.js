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

    // Fetch event using raw SQL as a backup for client sync issues
    const events = await prisma.$queryRawUnsafe(
      `SELECT id, "uniquenessField" FROM "Event" WHERE "shareCode" = $1`,
      shareCode
    );
    const event = events[0];

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const uField = event.uniquenessField || 'phone';
    let existingGuest = null;

    if (uField === 'phone') {
      existingGuest = await prisma.guest.findUnique({
        where: {
          eventId_phone: {
            eventId: event.id,
            phone: value
          }
        }
      });
    } else {
      // Check custom field
      const guests = await prisma.guest.findMany({
        where: { eventId: event.id }
      });

      existingGuest = guests.find(g => {
        try {
          const d = JSON.parse(g.additionalData || '{}');
          return String(d[uField] || '').trim().toLowerCase() === String(value).trim().toLowerCase();
        } catch (e) {
          return false;
        }
      });
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
