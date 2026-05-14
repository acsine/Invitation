import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';

export async function POST(request) {
  try {
    const { id, eventId, name, phone, photoUrl, generatedImageUrl, additionalData, saveToCloud } = await request.json();

    if (!eventId || (!name && !photoUrl) || !phone) {
      return NextResponse.json({ error: 'Champs manquants (Nom, Photo et Téléphone requis)' }, { status: 400 });
    }

    if (!isConfigured) {
      return NextResponse.json({ 
        error: 'ImageKit non configuré. Veuillez ajouter vos clés dans le fichier .env' 
      }, { status: 400 });
    }

    // Fetch event using raw SQL to bypass Prisma Client validation for the new field
    const events = await prisma.$queryRawUnsafe(
      `SELECT "uniquenessField" FROM "Event" WHERE id = $1`,
      eventId
    );
    const event = events[0];

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const uField = event.uniquenessField || 'phone';
    let existingGuest = null;

    if (uField === 'phone') {
      existingGuest = await prisma.guest.findUnique({
        where: {
          eventId_phone: {
            eventId,
            phone
          }
        }
      });
    } else {
      // Check custom field in additionalData (which is stored as String)
      const parsedNewData = JSON.parse(additionalData || '{}');
      const newValue = String(parsedNewData[uField] || '').trim().toLowerCase();

      if (newValue) {
        const guests = await prisma.guest.findMany({
          where: { eventId }
        });

        existingGuest = guests.find(g => {
          try {
            const d = JSON.parse(g.additionalData || '{}');
            return String(d[uField] || '').trim().toLowerCase() === newValue;
          } catch (e) {
            return false;
          }
        });
      }
    }

    if (existingGuest) {
      return NextResponse.json({ 
        error: 'DOUBLON',
        message: `Une inscription existe déjà avec ce ${uField === 'phone' ? 'numéro de téléphone' : uField}.`,
        guest: {
          id: existingGuest.id,
          name: existingGuest.name,
          generatedImageUrl: existingGuest.generatedImageUrl
        }
      }, { status: 409 });
    }

    try {
      let finalGeneratedUrl = null;
      // ...
      // Only upload to ImageKit if generatedImageUrl is provided AND saveToCloud is not false
      if (generatedImageUrl && saveToCloud !== false) {
        const uploadResponse = await imagekit.upload({
          file: generatedImageUrl,
          fileName: `invitation_${uuidv4()}.png`,
          folder: '/invitations',
        });
        finalGeneratedUrl = uploadResponse.url;
      }

      // Upload guest photo if provided
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
          name: name || 'Invité',
          phone,
          photoUrl: finalPhotoUrl,
          generatedImageUrl: finalGeneratedUrl,
          additionalData: additionalData || '{}',
          status: 'PENDING',
        },
      });

      return NextResponse.json(guest, { status: 201 });
    } catch (uploadError) {
      console.error('ImageKit upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Erreur d\'authentification ImageKit. Vérifiez vos clés dans le fichier .env' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Guest creation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
