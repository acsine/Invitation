import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const dbUrl = process.env.DATABASE_URL || '';

    let rawEvents = [];
    let staffCount = 0;
    let recentGuestsRaw = [];

    // Helper function to query via Neon HTTP serverless
    const fetchViaNeonHttp = async () => {
      const sql = neon(dbUrl);
      
      // Fetch events with guest counts & payments
      const eventRows = isAdmin 
        ? await sql`
            SELECT 
              e.id, e.name, e."isPaid", e.price, e."startDate", e."endDate", e."createdAt",
              g.id as guest_id, g.name as guest_name, g.phone as guest_phone,
              g.status as guest_status, g.attendance as guest_attendance, g."submittedAt" as guest_submitted_at,
              g."photoUrl" as guest_photo, p.amount as payment_amount, p."transactionRef" as payment_ref
            FROM "Event" e
            LEFT JOIN "Guest" g ON g."eventId" = e.id
            LEFT JOIN "Payment" p ON p."guestId" = g.id
            ORDER BY e."createdAt" DESC
          `
        : await sql`
            SELECT 
              e.id, e.name, e."isPaid", e.price, e."startDate", e."endDate", e."createdAt",
              g.id as guest_id, g.name as guest_name, g.phone as guest_phone,
              g.status as guest_status, g.attendance as guest_attendance, g."submittedAt" as guest_submitted_at,
              g."photoUrl" as guest_photo, p.amount as payment_amount, p."transactionRef" as payment_ref
            FROM "Event" e
            LEFT JOIN "Guest" g ON g."eventId" = e.id
            LEFT JOIN "Payment" p ON p."guestId" = g.id
            WHERE e."userId" = ${userId}
            ORDER BY e."createdAt" DESC
          `;

      // Group rows into event objects
      const eventsMap = new Map();
      eventRows.forEach(row => {
        if (!eventsMap.has(row.id)) {
          eventsMap.set(row.id, {
            id: row.id,
            name: row.name,
            isPaid: row.isPaid,
            price: row.price,
            startDate: row.startDate,
            endDate: row.endDate,
            createdAt: row.createdAt,
            guests: []
          });
        }
        if (row.guest_id) {
          eventsMap.get(row.id).guests.push({
            id: row.guest_id,
            name: row.guest_name,
            phone: row.guest_phone,
            status: row.guest_status,
            attendance: row.guest_attendance,
            submittedAt: row.guest_submitted_at,
            photoUrl: row.guest_photo,
            payment: row.payment_amount ? { amount: row.payment_amount, transactionRef: row.payment_ref } : null
          });
        }
      });
      rawEvents = Array.from(eventsMap.values());

      // Fetch Staff Count
      const staffRows = isAdmin 
        ? await sql`SELECT COUNT(*)::int as count FROM "User" WHERE role = 'STAFF'`
        : await sql`SELECT COUNT(*)::int as count FROM "User" WHERE "parentId" = ${userId}`;
      staffCount = staffRows[0]?.count || 0;

      // Fetch Recent 5 Guests
      recentGuestsRaw = isAdmin
        ? await sql`
            SELECT g.id, g.name, g.phone, g.status, g."submittedAt", g."photoUrl", e.name as event_name, p.amount as payment_amount, p."transactionRef" as payment_ref
            FROM "Guest" g
            JOIN "Event" e ON g."eventId" = e.id
            LEFT JOIN "Payment" p ON p."guestId" = g.id
            ORDER BY g."submittedAt" DESC
            LIMIT 5
          `
        : await sql`
            SELECT g.id, g.name, g.phone, g.status, g."submittedAt", g."photoUrl", e.name as event_name, p.amount as payment_amount, p."transactionRef" as payment_ref
            FROM "Guest" g
            JOIN "Event" e ON g."eventId" = e.id
            LEFT JOIN "Payment" p ON p."guestId" = g.id
            WHERE e."userId" = ${userId}
            ORDER BY g."submittedAt" DESC
            LIMIT 5
          `;
    };

    // Try Prisma first, fallback to Neon HTTP if Prisma throws network connection error
    try {
      if (dbUrl.includes('neon.tech')) {
        await fetchViaNeonHttp();
      } else {
        const eventWhere = isAdmin ? {} : { userId };
        rawEvents = await prisma.event.findMany({
          where: eventWhere,
          include: { guests: { include: { payment: true } } },
          orderBy: { createdAt: 'desc' },
        });

        staffCount = await prisma.user.count({
          where: isAdmin ? { role: 'STAFF' } : { parentId: userId },
        });

        const recent = await prisma.guest.findMany({
          where: isAdmin ? {} : { event: { userId } },
          include: { event: { select: { name: true } }, payment: true },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        });

        recentGuestsRaw = recent.map(g => ({
          id: g.id,
          name: g.name,
          phone: g.phone,
          status: g.status,
          submittedAt: g.submittedAt,
          photoUrl: g.photoUrl,
          event_name: g.event?.name,
          payment_amount: g.payment?.amount,
          payment_ref: g.payment?.transactionRef,
        }));
      }
    } catch (err) {
      console.warn('Prisma query failed, trying Neon HTTP fallback:', err?.message);
      await fetchViaNeonHttp();
    }

    // 3. Compute Real Metrics from DB
    const totalEvents = rawEvents.length;
    let totalGuests = 0;
    let totalConfirmed = 0;
    let totalPending = 0;
    let totalCancelled = 0;
    let totalCheckedIn = 0;
    let totalRevenue = 0;

    rawEvents.forEach(event => {
      (event.guests || []).forEach(guest => {
        totalGuests++;
        
        if (guest.status === 'PAID' || guest.status === 'CONFIRMED') {
          totalConfirmed++;
        } else if (guest.status === 'CANCELLED') {
          totalCancelled++;
        } else {
          totalPending++;
        }

        try {
          const attendance = typeof guest.attendance === 'string' ? JSON.parse(guest.attendance || '{}') : (guest.attendance || {});
          if (Object.values(attendance).some(val => val === true)) {
            totalCheckedIn++;
          }
        } catch (e) {}

        if (guest.payment?.amount || guest.payment_amount) {
          totalRevenue += (guest.payment?.amount || guest.payment_amount || 0);
        }
      });
    });

    // 4. Monthly Activity Breakdown (Real DB dates)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();

    const monthlyCashflow = months.map((monthName, index) => {
      let income = 0;
      let outcome = 0;

      rawEvents.forEach(event => {
        (event.guests || []).forEach(guest => {
          const guestDate = new Date(guest.submittedAt || guest.guest_submitted_at || Date.now());
          if (guestDate.getFullYear() === currentYear && guestDate.getMonth() === index) {
            income += 1;
            try {
              const att = typeof guest.attendance === 'string' ? JSON.parse(guest.attendance || '{}') : (guest.attendance || {});
              if (Object.values(att).some(val => val === true)) {
                outcome += 1;
              }
            } catch (e) {}
          }
        });
      });

      return {
        month: monthName,
        income,
        outcome,
      };
    });

    // 5. Table Data (Real Events)
    const projectSummary = rawEvents.slice(0, 5).map(event => {
      const eventGuests = event.guests || [];
      const total = eventGuests.length;
      const checkedIn = eventGuests.filter(g => {
        try {
          const att = typeof g.attendance === 'string' ? JSON.parse(g.attendance || '{}') : (g.attendance || {});
          return Object.values(att).some(val => val === true) || g.status === 'PAID' || g.status === 'CONFIRMED';
        } catch { return false; }
      }).length;

      const progress = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

      const startDateStr = event.startDate 
        ? new Date(event.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date(event.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      
      return {
        id: event.id,
        name: event.name,
        type: event.isPaid ? 'Événement Payant' : 'Événement Gratuit',
        startDate: startDateStr,
        progress: progress,
        totalGuests: total,
      };
    });

    // 6. Recent Registrations / Payments Formatted
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&q=80',
    ];

    const recentPaymentsFormatted = recentGuestsRaw.map((g, idx) => {
      const dateObj = new Date(g.submittedAt || Date.now());
      const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

      return {
        id: g.id,
        name: g.name,
        sub: g.event_name || 'Événement',
        amount: g.payment_amount ? `${g.payment_amount.toLocaleString()} FCFA` : (g.status === 'PAID' ? 'Payé' : 'Gratuit'),
        method: g.payment_ref ? 'Mobile Money' : 'Pass QR',
        date: formattedDate,
        avatar: g.photoUrl || avatars[idx % avatars.length],
      };
    });

    // 7. Dynamic Pie Chart Breakdown (Exact Real Database Metrics)
    const pieDistribution = [
      { name: 'Confirmés', value: totalConfirmed, color: '#3B52E8' },
      { name: 'En attente', value: totalPending, color: '#F59E0B' },
      { name: 'Présents (Scannés)', value: totalCheckedIn, color: '#06B6D4' },
      { name: 'Annulés', value: totalCancelled, color: '#EF4444' },
    ];

    return NextResponse.json({
      connected: true,
      database: dbUrl.includes('neon.tech') ? 'Neon PostgreSQL (HTTP/Serverless)' : 'PostgreSQL Local',
      totalEvents,
      totalGuests,
      totalStaff: staffCount,
      totalRevenue,
      projectSummary,
      pieDistribution,
      monthlyCashflow,
      recentPayments: recentPaymentsFormatted,
    });

  } catch (error) {
    console.error('Fetch dashboard overview error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des données du dashboard' }, { status: 500 });
  }
}
