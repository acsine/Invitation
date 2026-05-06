import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: eventId } = await params;
    const { guestId, sessionKey } = await request.json();

    if (!guestId || !sessionKey) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // 1. Fetch current attendance
    const guest = await prisma.guest.findUnique({
      where: { id: guestId, eventId },
      select: { attendance: true }
    });

    if (!guest) {
      return NextResponse.json({ error: 'Invité non trouvé' }, { status: 404 });
    }

    const attendanceMap = JSON.parse(guest.attendance || '{}');
    attendanceMap[sessionKey] = true;

    // 2. Update database
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        attendance: JSON.stringify(attendanceMap)
      }
    });

    return NextResponse.json({ success: true, attendance: updatedGuest.attendance });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
