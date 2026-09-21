import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';

export async function POST(request) {
  try {
    const { id, eventId, name, phone, photoUrl, generatedImageUrl, additionalData, saveToCloud } = await request.json();

    const trimmedPhone = phone ? String(phone).trim() : '';

    if (!eventId || !name || !trimmedPhone) {
      return NextResponse.json({ 
        error: 'Le numéro de téléphone et le nom sont des champs obligatoires.' 
      }, { status: 400 });
    }

    if (!isConfigured) {
      return NextResponse.json({ 
        error: 'ImageKit non configuré. Veuillez ajouter vos clés dans le fichier .env' 
      }, { status: 400 });
    }

    // Fetch event using raw SQL
    const events = await prisma.$queryRawUnsafe(
      `SELECT "uniquenessField" FROM "Event" WHERE id = $1`,
      eventId
    );
    const event = events[0];

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // 1. Check exact phone uniqueness per event
    let existingGuest = await prisma.guest.findUnique({
      where: {
        eventId_phone: {
          eventId,
          phone: trimmedPhone
        }
      }
    });

    // 2. Check normalized phone digits (to catch duplicates with different formatting like +237 vs 69...)
    if (!existingGuest) {
      const cleanDigits = trimmedPhone.replace(/[^\d]/g, '');
      if (cleanDigits.length >= 8) {
        const allGuests = await prisma.guest.findMany({
          where: { eventId },
          select: { id: true, name: true, phone: true, generatedImageUrl: true }
        });

        existingGuest = allGuests.find(g => {
          if (!g.phone) return false;
          const gClean = g.phone.replace(/[^\d]/g, '');
          if (gClean === cleanDigits) return true;
          if (gClean.length >= 8 && cleanDigits.length >= 8) {
            return gClean.slice(-8) === cleanDigits.slice(-8);
          }
          return false;
        });
      }
    }

    if (existingGuest) {
      return NextResponse.json({ 
        error: 'DOUBLON',
        message: 'Ce numéro de téléphone est déjà inscrit à cet événement.',
        guest: {
          id: existingGuest.id,
          name: existingGuest.name,
          generatedImageUrl: existingGuest.generatedImageUrl
        }
      }, { status: 409 });
    }

    try {
      let finalGeneratedUrl = null;
      if (generatedImageUrl && saveToCloud !== false) {
        const uploadResponse = await imagekit.upload({
          file: generatedImageUrl,
          fileName: `invitation_${uuidv4()}.png`,
          folder: '/invitations',
        });
        finalGeneratedUrl = uploadResponse.url;
      }

      let finalPhotoUrl = null;
      if (photoUrl && photoUrl.startsWith('data:image')) {
        const photoUpload = await imagekit.upload({
          file: photoUrl,
          fileName: `guest_${uuidv4()}.png`,
          folder: '/guests',
        });
        finalPhotoUrl = photoUpload.url;
      }

      const guest = await prisma.guest.create({
        data: {
          id: id || uuidv4(),
          eventId,
          name: name ? String(name).trim() : 'Invité',
          phone: trimmedPhone,
          photoUrl: finalPhotoUrl,
          generatedImageUrl: finalGeneratedUrl,
          additionalData: additionalData || '{}',
          status: 'PENDING',
        },
      });

      return NextResponse.json(guest, { status: 201 });
    } catch (uploadOrDbError) {
      if (uploadOrDbError?.code === 'P2002') {
        return NextResponse.json({
          error: 'DOUBLON',
          message: 'Ce numéro de téléphone est déjà inscrit à cet événement.'
        }, { status: 409 });
      }
      console.error('ImageKit upload or DB error:', uploadOrDbError);
      return NextResponse.json({ 
        error: 'Erreur lors de la création de l\'invité' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Guest creation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
