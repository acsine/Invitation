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
