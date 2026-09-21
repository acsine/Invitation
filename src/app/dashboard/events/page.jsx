import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import EventsTable from '@/components/dashboard/EventsTable';
import { neon } from '@neondatabase/serverless';

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Accès refusé</div>;
  }

  let events = [];
  const dbUrl = process.env.DATABASE_URL || '';

  try {
    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT 
          e.id, 
          e.name, 
          e."backgroundImageUrl", 
          e."shareCode", 
          e."isPaid",
          e."price",
          e."paymentMethod",
          e."paymentNumber",
          e."attendanceDays",
          e."startDate",
          e."endDate",
          e."sessionsPerDay",
          e."customFields",
          e."uniquenessField",
          e."createdAt",
          COUNT(g.id)::int AS guest_count
        FROM "Event" e
        LEFT JOIN "Guest" g ON g."eventId" = e.id
        WHERE e."userId" = ${session.user.id}
        GROUP BY e.id
        ORDER BY e."createdAt" DESC
      `;
      events = rows.map(r => ({
        id: r.id,
        name: r.name,
        backgroundImageUrl: r.backgroundImageUrl,
        shareCode: r.shareCode,
        isPaid: r.isPaid,
        price: r.price,
        paymentMethod: r.paymentMethod,
        paymentNumber: r.paymentNumber,
        attendanceDays: r.attendanceDays,
        startDate: r.startDate,
        endDate: r.endDate,
        sessionsPerDay: r.sessionsPerDay,
        customFields: r.customFields,
        uniquenessField: r.uniquenessField,
        createdAt: r.createdAt,
        _count: { guests: r.guest_count || 0 }
      }));
    } else {
      events = await prisma.event.findMany({
        where: { userId: session.user.id },
        include: { _count: { select: { guests: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Prisma query failed, falling back to Neon HTTP:', error);
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT 
          e.id, 
          e.name, 
          e."backgroundImageUrl", 
          e."shareCode", 
          e."isPaid",
          e."price",
          e."paymentMethod",
          e."paymentNumber",
          e."attendanceDays",
          e."startDate",
          e."endDate",
          e."sessionsPerDay",
          e."customFields",
          e."uniquenessField",
          e."createdAt",
          COUNT(g.id)::int AS guest_count
        FROM "Event" e
        LEFT JOIN "Guest" g ON g."eventId" = e.id
        WHERE e."userId" = ${session.user.id}
        GROUP BY e.id
        ORDER BY e."createdAt" DESC
      `;
      events = rows.map(r => ({
        id: r.id,
        name: r.name,
        backgroundImageUrl: r.backgroundImageUrl,
        shareCode: r.shareCode,
        isPaid: r.isPaid,
        price: r.price,
        paymentMethod: r.paymentMethod,
        paymentNumber: r.paymentNumber,
        attendanceDays: r.attendanceDays,
        startDate: r.startDate,
        endDate: r.endDate,
        sessionsPerDay: r.sessionsPerDay,
        customFields: r.customFields,
        uniquenessField: r.uniquenessField,
        createdAt: r.createdAt,
        _count: { guests: r.guest_count || 0 }
      }));
    } catch (err) {
      console.error('Neon HTTP fallback failed:', err);
    }
  }

  return (
    <div className="w-full">
      <EventsTable events={events} />
    </div>
  );
}
