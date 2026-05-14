import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { shareCode } = await params;

    // Use raw SQL to bypass Prisma Client validation for the new field
    const events = await prisma.$queryRawUnsafe(
      `SELECT id, name, "backgroundImageUrl", zones, "isPaid", price, "paymentNumber", "customFields", "attendanceDays", "uniquenessField" FROM "Event" WHERE "shareCode" = $1`,
      shareCode
    );
    const event = events[0];

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Fetch event error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
