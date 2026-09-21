import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const dbUrl = process.env.DATABASE_URL || '';

    // Check ownership & delete via Neon HTTP if available or fallback
    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const rows = await sql`SELECT "userId" FROM "Event" WHERE id = ${id}`;
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }
      if (rows[0].userId !== session.user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      await sql`DELETE FROM "Event" WHERE id = ${id}`;
      return NextResponse.json({ message: 'Événement supprimé avec succès' });
    }

    // Check if the event belongs to the user via Prisma
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

    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Delete event error:', error);
    // Fallback to Neon HTTP on error
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      if (dbUrl.includes('neon.tech')) {
        const sql = neon(dbUrl);
        await sql`DELETE FROM "Event" WHERE id = ${params.id || id}`;
        return NextResponse.json({ message: 'Événement supprimé avec succès' });
      }
    } catch (fallbackErr) {
      console.error('Delete fallback error:', fallbackErr);
    }
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const dbUrl = process.env.DATABASE_URL || '';
    
    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const events = await sql`SELECT * FROM "Event" WHERE id = ${id}`;
      if (events.length === 0 || (session && events[0].userId !== session.user?.id)) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }
      const guests = await sql`SELECT * FROM "Guest" WHERE "eventId" = ${id} ORDER BY "submittedAt" DESC`;
      const eventData = { ...events[0], guests };
      return NextResponse.json(eventData);
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        guests: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!event || (session && event.userId !== session.user?.id)) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const data = await request.json();

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const dbUrl = process.env.DATABASE_URL || '';

    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const rows = await sql`SELECT "userId" FROM "Event" WHERE id = ${id}`;
      if (rows.length === 0 || rows[0].userId !== session.user.id) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      await sql`UPDATE "Event" SET "uniquenessField" = ${data.uniquenessField} WHERE id = ${id}`;
      const updated = await sql`SELECT * FROM "Event" WHERE id = ${id}`;
      return NextResponse.json(updated[0]);
    }

    // Check ownership
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "Event" SET "uniquenessField" = $1 WHERE id = $2`,
      data.uniquenessField,
      id
    );

    const updatedEvent = await prisma.event.findUnique({ where: { id } });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
