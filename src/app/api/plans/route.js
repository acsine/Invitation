import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';

  try {
    let plans = [];
    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT id, name, price, "maxEvents", "maxGuests", features, "createdAt", "updatedAt"
        FROM "Plan"
        ORDER BY price ASC
      `;
      plans = rows.map(r => ({
        id: r.id,
        name: r.name,
        price: Number(r.price) || 0,
        maxEvents: Number(r.maxEvents) || 1,
        maxGuests: Number(r.maxGuests) || 50,
        features: r.features || '[]',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
    } else {
      plans = await prisma.plan.findMany({
        orderBy: { price: 'asc' }
      });
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('/api/plans error, fallback to Neon HTTP:', error);
    try {
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT id, name, price, "maxEvents", "maxGuests", features, "createdAt", "updatedAt"
        FROM "Plan"
        ORDER BY price ASC
      `;
      const plans = rows.map(r => ({
        id: r.id,
        name: r.name,
        price: Number(r.price) || 0,
        maxEvents: Number(r.maxEvents) || 1,
        maxGuests: Number(r.maxGuests) || 50,
        features: r.features || '[]',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));
      return NextResponse.json(plans);
    } catch (err) {
      console.error('Neon HTTP fallback failed in /api/plans:', err);
      return NextResponse.json([
        {
          id: 'free',
          name: 'Gratuit',
          price: 0,
          maxEvents: 1,
          maxGuests: 50,
          features: JSON.stringify(['Pass QR Code Mobile', 'Export PDF Basique'])
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 10000,
          maxEvents: 9999,
          maxGuests: 99999,
          features: JSON.stringify(['Événements illimités', 'Badges HD illimités (PDF)', 'Scan illimité anti-fraude', 'Support prioritaire 24/7'])
        }
      ]);
    }
  }
}
