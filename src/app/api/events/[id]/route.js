import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if the event belongs to the user
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Delete the event. 
    // Prisma with onDelete: Cascade will handle guests, badgeTemplate, and payments.
    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
    try {
      const { id } = await params;
      const session = await getServerSession(authOptions);
      
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          guests: {
            orderBy: { submittedAt: 'desc' },
          },
        },
      });
  
      if (!event || event.userId !== session.user.id) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }
  
      return NextResponse.json(event);
    } catch (error) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
  }
