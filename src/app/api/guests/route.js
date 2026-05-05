import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';

export async function POST(request) {
  try {
    const { eventId, name, photoUrl, generatedImageUrl, saveToCloud } = await request.json();

    if (!eventId || (!name && !photoUrl)) {
      return NextResponse.json({ error: 'Champs manquants (Nom ou Photo requis)' }, { status: 400 });
    }

    if (!isConfigured) {
      return NextResponse.json({ 
        error: 'ImageKit non configuré. Veuillez ajouter vos clés dans le fichier .env' 
      }, { status: 400 });
    }

    try {
      let finalGeneratedUrl = null;
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
          eventId,
          name: name || 'Invité',
          photoUrl: finalPhotoUrl,
          generatedImageUrl: finalGeneratedUrl,
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
