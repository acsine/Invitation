import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';
import { neon } from '@neondatabase/serverless';

const parseValidDate = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, backgroundImageUrl = '', zones = [], designWidth = 800, designHeight = 1120, 
      isPaid = false, price = 0, paymentMethod = '', paymentNumber = '', 
      customFields = '[]', attendanceDays = 1, startDate = null, endDate = null, 
      sessionsPerDay = 1, sessionConfig = '[]' 
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Veuillez saisir le nom de l\'événement' }, { status: 400 });
    }

    // Handle base64 image upload safely
    let finalImageUrl = backgroundImageUrl || null;
    if (backgroundImageUrl && backgroundImageUrl.startsWith('data:image')) {
      if (isConfigured) {
        try {
          const uploadResponse = await imagekit.upload({
            file: backgroundImageUrl,
            fileName: `poster_${uuidv4()}.png`,
            folder: '/posters',
          });
          finalImageUrl = uploadResponse.url;
        } catch (uploadError) {
          console.warn('ImageKit upload warning, using raw data URI:', uploadError?.message);
        }
      }
    }

    const startDateObj = parseValidDate(startDate);
    const endDateObj = parseValidDate(endDate);

    if (startDateObj) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDateObj < today) {
        return NextResponse.json({ error: 'La date de début ne peut pas être une date passée' }, { status: 400 });
      }
    }
    const zonesStr = typeof zones === 'string' ? zones : JSON.stringify({ elements: zones, designWidth, designHeight });
    const customFieldsStr = typeof customFields === 'string' ? customFields : JSON.stringify(customFields);
    const sessionConfigStr = typeof sessionConfig === 'string' ? sessionConfig : JSON.stringify(sessionConfig);
    const shareCode = uuidv4().substring(0, 8);
    const eventId = uuidv4();
    const dbUrl = process.env.DATABASE_URL || '';

    let createdEvent = null;

    // Helper to insert via Neon HTTP serverless over port 443
    const insertViaNeonHttp = async () => {
      const sql = neon(dbUrl);
      const rows = await sql`
        INSERT INTO "Event" (
          "id", "userId", "name", "backgroundImageUrl", "zones", 
          "isPaid", "price", "paymentMethod", "paymentNumber", 
          "shareCode", "customFields", "uniquenessField", "attendanceDays", 
          "startDate", "endDate", "sessionsPerDay", "sessionConfig", 
          "createdAt"
        ) VALUES (
          ${eventId}, ${session.user.id}, ${name.trim()}, ${finalImageUrl}, ${zonesStr}, 
          ${!!isPaid}, ${parseFloat(price) || 0}, ${paymentMethod || null}, ${paymentNumber || null}, 
          ${shareCode}, ${customFieldsStr}, 'phone', ${parseInt(attendanceDays) || 1}, 
          ${startDateObj}, ${endDateObj}, ${parseInt(sessionsPerDay) || 1}, ${sessionConfigStr}, 
          NOW()
        ) RETURNING *;
      `;
      return rows[0];
    };

    try {
      if (dbUrl.includes('neon.tech')) {
        createdEvent = await insertViaNeonHttp();
      } else {
        createdEvent = await prisma.event.create({
          data: {
            id: eventId,
            userId: session.user.id,
            name: name.trim(),
            backgroundImageUrl: finalImageUrl,
            zones: zonesStr,
            isPaid: !!isPaid,
            price: price ? parseFloat(price) : 0,
            paymentMethod: paymentMethod || null,
            paymentNumber: paymentNumber || null,
            customFields: customFieldsStr,
            attendanceDays: parseInt(attendanceDays) || 1,
            startDate: startDateObj,
            endDate: endDateObj,
            sessionsPerDay: parseInt(sessionsPerDay) || 1,
            sessionConfig: sessionConfigStr,
            shareCode: shareCode,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma create event failed, trying Neon HTTP fallback:', dbErr?.message);
      createdEvent = await insertViaNeonHttp();
    }

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error) {
    console.error('Event creation route error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création de l\'événement' }, { status: 500 });
  }
}
