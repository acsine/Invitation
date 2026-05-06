import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { 
      name, backgroundImageUrl, zones, designWidth, designHeight, 
      isPaid, price, paymentMethod, paymentNumber, 
      customFields, attendanceDays, startDate, endDate, 
      sessionsPerDay, sessionConfig 
    } = await request.json();

    // Upload base64 to ImageKit if it's a new image
    let finalImageUrl = backgroundImageUrl;
    if (backgroundImageUrl.startsWith('data:image')) {
      if (!isConfigured) {
        return NextResponse.json({ 
          error: 'ImageKit non configuré. Veuillez ajouter vos clés dans le fichier .env' 
        }, { status: 400 });
      }

      try {
        const uploadResponse = await imagekit.upload({
          file: backgroundImageUrl,
          fileName: `poster_${uuidv4()}.png`,
          folder: '/posters',
        });
        finalImageUrl = uploadResponse.url;
      } catch (uploadError) {
        console.error('ImageKit upload error:', uploadError);
        return NextResponse.json({ 
          error: 'Erreur d\'authentification ImageKit. Vérifiez vos clés dans le fichier .env' 
        }, { status: 401 });
      }
    }

    const event = await prisma.event.create({
      data: {
        userId: session.user.id,
        name,
        backgroundImageUrl: finalImageUrl,
        zones: JSON.stringify({ elements: zones, designWidth, designHeight }),
        isPaid: !!isPaid,
        price: price ? parseFloat(price) : 0,
        paymentMethod,
        paymentNumber,
        customFields: customFields || '[]',
        attendanceDays: attendanceDays || 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sessionsPerDay: parseInt(sessionsPerDay) || 1,
        sessionConfig: sessionConfig || '[]',
        shareCode: uuidv4().substring(0, 8),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
