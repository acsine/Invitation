import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const template = await prisma.badgeTemplate.findFirst({
      where: { eventId: id },
    });
    return NextResponse.json(template || {});
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { backgroundImageUrl, zones } = await request.json();

    let finalImageUrl = backgroundImageUrl;
    if (backgroundImageUrl && backgroundImageUrl.startsWith('data:image')) {
      if (!isConfigured) {
        return NextResponse.json({ 
          error: 'ImageKit non configuré. Veuillez ajouter vos clés dans le fichier .env' 
        }, { status: 400 });
      }

      try {
        const uploadResponse = await imagekit.upload({
          file: backgroundImageUrl,
          fileName: `badge_bg_${uuidv4()}.png`,
          folder: '/badges',
        });
        finalImageUrl = uploadResponse.url;
      } catch (uploadError) {
        console.error('ImageKit upload error:', uploadError);
        return NextResponse.json({ 
          error: 'Erreur d\'authentification ImageKit. Vérifiez vos clés dans le fichier .env' 
        }, { status: 401 });
      }
    }

    const template = await prisma.badgeTemplate.upsert({
      where: { eventId: id }, // This requires a unique constraint on eventId in BadgeTemplate
      update: {
        backgroundImageUrl: finalImageUrl,
        zones: JSON.stringify(zones),
      },
      create: {
        eventId: id,
        backgroundImageUrl: finalImageUrl,
        zones: JSON.stringify(zones),
        width: 86, // Default credit card size in mm
        height: 54,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Badge template error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
