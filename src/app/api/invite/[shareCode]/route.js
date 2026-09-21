import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';

export async function GET(request, { params }) {
  try {
    const { shareCode } = await params;
    const dbUrl = process.env.DATABASE_URL || '';

    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const events = await sql`
        SELECT id, name, "backgroundImageUrl", zones, "isPaid", price, "paymentNumber", "customFields", "attendanceDays", "uniquenessField" 
        FROM "Event" 
        WHERE "shareCode" = ${shareCode}
      `;
      if (events.length === 0) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }
      return NextResponse.json(events[0]);
    }

    // Fallback to Prisma if not on Neon or for local DB
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
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      if (dbUrl.includes('neon.tech')) {
        const sql = neon(dbUrl);
        const events = await sql`SELECT id, name, "backgroundImageUrl", zones, "isPaid", price, "paymentNumber", "customFields", "attendanceDays", "uniquenessField" FROM "Event" WHERE "shareCode" = ${params.shareCode}`;
        if (events[0]) return NextResponse.json(events[0]);
      }
    } catch (fErr) {
      console.error('Fetch fallback error:', fErr);
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
