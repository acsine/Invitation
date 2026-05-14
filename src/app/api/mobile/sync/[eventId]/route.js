import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request, { params }) {
  try {
    const { eventId } = await params;
    const { guests } = await request.json();

    if (!eventId || !Array.isArray(guests)) {
      return NextResponse.json({ error: 'Données de synchronisation invalides' }, { status: 400 });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      details: []
    };

    // Sequential processing to handle uniqueness constraints correctly
    for (const guestData of guests) {
      try {
        const { id, name, phone, additionalData, attendance, status } = guestData;

        if (!phone) {
          results.errors++;
          results.details.push({ phone: 'missing', error: 'Téléphone requis' });
          continue;
        }

        // Check if guest exists by eventId and phone
        const existingGuest = await prisma.guest.findUnique({
          where: {
            eventId_phone: {
              eventId,
              phone
            }
          }
        });

        if (existingGuest) {
          // Update attendance if provided (merge JSON)
          const newAttendance = attendance ? { 
            ...JSON.parse(existingGuest.attendance || '{}'), 
            ...JSON.parse(attendance || '{}') 
          } : JSON.parse(existingGuest.attendance || '{}');

          await prisma.guest.update({
            where: { id: existingGuest.id },
            data: {
              name: name || existingGuest.name,
              additionalData: additionalData || existingGuest.additionalData,
              attendance: JSON.stringify(newAttendance),
              status: status || existingGuest.status,
            }
          });
          results.updated++;
        } else {
          // Create new guest
          await prisma.guest.create({
            data: {
              id: id || uuidv4(),
              eventId,
              name: name || 'Invité',
              phone,
              additionalData: additionalData || '{}',
              attendance: attendance || '{}',
              status: status || 'PENDING',
            }
          });
          results.created++;
        }
      } catch (err) {
        console.error('Guest sync error for:', guestData.phone, err);
        results.errors++;
        results.details.push({ phone: guestData.phone, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      summary: results
    });
  } catch (error) {
    console.error('Mobile sync error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { eventId } = await params;

    const guests = await prisma.guest.findMany({
      where: { eventId },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Mobile fetch guests error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
