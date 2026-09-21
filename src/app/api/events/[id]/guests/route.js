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

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await request.json();

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true }
    });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Single or Bulk insertion
    const itemsToInsert = Array.isArray(body.guests) ? body.guests : [body];

    if (itemsToInsert.length === 0) {
      return NextResponse.json({ error: 'Aucune donnée fournie' }, { status: 400 });
    }

    if (itemsToInsert.length === 1) {
      const singleItem = itemsToInsert[0];
      const singlePhone = singleItem.phone || singleItem.telephone || singleItem['Téléphone'] || singleItem['Phone'];
      if (!singlePhone || !String(singlePhone).trim()) {
        return NextResponse.json({ error: 'Le numéro de téléphone est un champ obligatoire.' }, { status: 400 });
      }
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of itemsToInsert) {
      const name = item.name || item.nom || item['Nom Complet'] || item['Nom'] || 'Invité';
      const rawPhone = item.phone || item.telephone || item['Téléphone'] || item['Phone'] || null;
      const phone = rawPhone ? String(rawPhone).trim() : null;
      const status = item.status || 'PAID';
      
      if (!phone) {
        skippedCount++;
        continue;
      }

      const customData = item.additionalData ? (typeof item.additionalData === 'string' ? JSON.parse(item.additionalData) : item.additionalData) : {};
      
      // Store all remaining columns in customData if importing from raw Excel row
      Object.keys(item).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (!['name', 'nom', 'nom complet', 'phone', 'telephone', 'téléphone', 'status', 'additionaldata'].includes(lowerKey)) {
          customData[key] = item[key];
        }
      });

      try {
        await prisma.guest.create({
          data: {
            eventId,
            name: String(name).trim(),
            phone,
            status,
            additionalData: JSON.stringify(customData),
          }
        });
        createdCount++;
      } catch (err) {
        // Handle duplicate phone or unique constraint
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      createdCount,
      skippedCount,
      total: itemsToInsert.length
    });

  } catch (error) {
    console.error('Create/Import guests error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { fieldName } = await request.json();

    if (!fieldName || fieldName === 'none') {
      return NextResponse.json({ error: 'Champ d\'unicité non spécifié' }, { status: 400 });
    }

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Find duplicates
    const guests = await prisma.guest.findMany({
      where: { eventId: id },
      orderBy: { submittedAt: 'asc' } // Keep the oldest entry
    });

    const seen = new Set();
    const toDelete = [];

    for (const guest of guests) {
      let val;
      if (fieldName === 'phone') {
        val = guest.phone;
      } else {
        try {
          const data = JSON.parse(guest.additionalData || '{}');
          val = data[fieldName];
        } catch (e) {
          val = null;
        }
      }

      if (!val) continue;

      const key = String(val).trim().toLowerCase();
      if (seen.has(key)) {
        toDelete.push(guest.id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      await prisma.guest.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: toDelete.length 
    });

  } catch (error) {
    console.error('Clean duplicates error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
