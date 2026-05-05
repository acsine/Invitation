import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { shareCode } = await params;

    const event = await prisma.event.findUnique({
      where: { shareCode },
      select: {
        id: true,
        name: true,
        backgroundImageUrl: true,
        zones: true,
        isPaid: true,
        price: true,
        paymentNumber: true,
        customFields: true,
        attendanceDays: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Fetch event error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
