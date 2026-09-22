import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import imagekit, { isConfigured } from '@/lib/imagekit';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { id, eventId, name, phone, photoUrl, generatedImageUrl, additionalData, saveToCloud } = await request.json();

    const trimmedPhone = phone ? String(phone).trim() : '';

    if (!eventId || !name || !trimmedPhone) {
      return NextResponse.json({ 
        error: 'Le numéro de téléphone et le nom sont des champs obligatoires.' 
      }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL || '';
    const useNeon = dbUrl.includes('neon.tech');

    // Fetch event to validate it exists
    let event = null;
    if (useNeon) {
      const sql = neon(dbUrl);
      const events = await sql`SELECT "uniquenessField" FROM "Event" WHERE id = ${eventId}`;
      event = events[0];
    } else {
      const events = await prisma.$queryRawUnsafe(
        `SELECT "uniquenessField" FROM "Event" WHERE id = $1`,
        eventId
      );
      event = events[0];
    }

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // 1. Check exact phone uniqueness per event
    let existingGuest = null;
    if (useNeon) {
      const sql = neon(dbUrl);
      const rows = await sql`SELECT id, name, phone, "generatedImageUrl" FROM "Guest" WHERE "eventId" = ${eventId} AND phone = ${trimmedPhone} LIMIT 1`;
      existingGuest = rows[0] || null;
    } else {
      existingGuest = await prisma.guest.findUnique({
        where: {
          eventId_phone: {
            eventId,
            phone: trimmedPhone
          }
        }
      });
    }

    // 2. Check normalized phone digits (to catch duplicates with different formatting like +237 vs 69...)
    if (!existingGuest) {
      const cleanDigits = trimmedPhone.replace(/[^\d]/g, '');
      if (cleanDigits.length >= 8) {
        let allGuests = [];
        if (useNeon) {
          const sql = neon(dbUrl);
          allGuests = await sql`SELECT id, name, phone, "generatedImageUrl" FROM "Guest" WHERE "eventId" = ${eventId}`;
        } else {
          allGuests = await prisma.guest.findMany({
            where: { eventId },
            select: { id: true, name: true, phone: true, generatedImageUrl: true }
          });
        }

        existingGuest = allGuests.find(g => {
          if (!g.phone) return false;
          const gClean = g.phone.replace(/[^\d]/g, '');
          if (gClean === cleanDigits) return true;
          if (gClean.length >= 8 && cleanDigits.length >= 8) {
            return gClean.slice(-8) === cleanDigits.slice(-8);
          }
          return false;
        }) || null;
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
      if (generatedImageUrl && saveToCloud !== false && isConfigured) {
        const uploadResponse = await imagekit.upload({
          file: generatedImageUrl,
          fileName: `invitation_${uuidv4()}.png`,
          folder: '/invitations',
        });
        finalGeneratedUrl = uploadResponse.url;
      }

      let finalPhotoUrl = null;
      if (photoUrl && photoUrl.startsWith('data:image') && isConfigured) {
        const photoUpload = await imagekit.upload({
          file: photoUrl,
          fileName: `guest_${uuidv4()}.png`,
          folder: '/guests',
        });
        finalPhotoUrl = photoUpload.url;
      }

      const guestId = id || uuidv4();
      let guest = null;

      // Create guest - try Neon HTTP first if applicable, with Prisma fallback
      const createViaNeon = async () => {
        const sql = neon(dbUrl);
        const rows = await sql`
          INSERT INTO "Guest" (id, "eventId", name, phone, "photoUrl", "generatedImageUrl", "additionalData", status, "submittedAt")
          VALUES (${guestId}, ${eventId}, ${name ? String(name).trim() : 'Invité'}, ${trimmedPhone}, ${finalPhotoUrl}, ${finalGeneratedUrl}, ${additionalData || '{}'}, 'PENDING', NOW())
          RETURNING *
        `;
        return rows[0];
      };

      const createViaPrisma = async () => {
        return await prisma.guest.create({
          data: {
            id: guestId,
            eventId,
            name: name ? String(name).trim() : 'Invité',
            phone: trimmedPhone,
            photoUrl: finalPhotoUrl,
            generatedImageUrl: finalGeneratedUrl,
            additionalData: additionalData || '{}',
            status: 'PENDING',
          },
        });
      };

      try {
        guest = useNeon ? await createViaNeon() : await createViaPrisma();
      } catch (dbErr) {
        console.warn('Primary DB insert failed, trying fallback:', dbErr?.message);
        guest = useNeon ? await createViaPrisma() : await createViaNeon();
      }

      return NextResponse.json(guest, { status: 201 });
    } catch (uploadOrDbError) {
      if (uploadOrDbError?.code === 'P2002' || uploadOrDbError?.message?.includes('unique constraint')) {
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
