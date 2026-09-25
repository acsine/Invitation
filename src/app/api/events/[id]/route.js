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
      const rows = await sql`SELECT "userId", "isPaid", price FROM "Event" WHERE id = ${id}`;
      if (rows.length === 0 || rows[0].userId !== session.user.id) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const current = rows[0];
      const targetIsPaid = data.isPaid !== undefined ? !!data.isPaid : current.isPaid;
      const targetPrice = data.price !== undefined ? parseFloat(data.price) : current.price;

      if (targetIsPaid && targetPrice < 200) {
        return NextResponse.json({ 
          error: 'Le tarif minimum pour une invitation payante est de 200 FCFA (requis par la passerelle de paiement).' 
        }, { status: 400 });
      }

      const uniquenessField = data.uniquenessField !== undefined ? data.uniquenessField : undefined;
      const paymentNumber = data.paymentNumber !== undefined ? data.paymentNumber : undefined;

      await sql`
        UPDATE "Event" 
        SET 
          "uniquenessField" = COALESCE(${uniquenessField}, "uniquenessField"),
          "isPaid" = COALESCE(${data.isPaid !== undefined ? !!data.isPaid : null}, "isPaid"),
          "price" = COALESCE(${data.price !== undefined ? parseFloat(data.price) : null}, "price"),
          "paymentNumber" = COALESCE(${paymentNumber}, "paymentNumber")
        WHERE id = ${id}
      `;
      const updated = await sql`SELECT * FROM "Event" WHERE id = ${id}`;
      return NextResponse.json(updated[0]);
    }

    // Check ownership with Prisma
    const currentEvent = await prisma.event.findUnique({
      where: { id },
      select: { userId: true, isPaid: true, price: true }
    });

    if (!currentEvent || currentEvent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const targetIsPaid = data.isPaid !== undefined ? !!data.isPaid : currentEvent.isPaid;
    const targetPrice = data.price !== undefined ? parseFloat(data.price) : currentEvent.price;

    if (targetIsPaid && targetPrice < 200) {
      return NextResponse.json({ 
        error: 'Le tarif minimum pour une invitation payante est de 200 FCFA (requis par la passerelle de paiement).' 
      }, { status: 400 });
    }

    const updateData = {};
    if (data.uniquenessField !== undefined) updateData.uniquenessField = data.uniquenessField;
    if (data.isPaid !== undefined) updateData.isPaid = !!data.isPaid;
    if (data.price !== undefined) updateData.price = parseFloat(data.price) || 0;
    if (data.paymentNumber !== undefined) updateData.paymentNumber = data.paymentNumber;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
