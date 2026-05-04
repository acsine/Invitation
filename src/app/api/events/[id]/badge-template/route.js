import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { backgroundImageUrl, zones, designWidth, designHeight } = await request.json();

    const template = await prisma.badgeTemplate.upsert({
      where: { eventId: id },
      update: {
        backgroundImageUrl,
        zones: JSON.stringify({ elements: zones, designWidth, designHeight })
      },
      create: {
        eventId: id,
        backgroundImageUrl,
        zones: JSON.stringify({ elements: zones, designWidth, designHeight })
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Badge template error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
    try {
      const { id } = await params;
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  
      const template = await prisma.badgeTemplate.findUnique({
        where: { eventId: id }
      });
  
      return NextResponse.json(template || { zones: '[]', backgroundImageUrl: null });
    } catch (error) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
  }
