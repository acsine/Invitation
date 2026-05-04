import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { jsPDF } from 'jspdf';
import sharp from 'sharp';
import axios from 'axios';

export async function GET(request, { params }) {
  try {
    const { eventId } = params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        badgeTemplate: true,
        guests: { where: { status: 'PAID' } }
      },
    });

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
    }

    if (!event.badgeTemplate) {
      return NextResponse.json({ error: 'Template de badge non défini' }, { status: 400 });
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const badgeW = event.badgeTemplate.width;
    const badgeH = event.badgeTemplate.height;
    const margin = 10;
    const spacing = 5;
    
    let x = margin;
    let y = margin;

    // Fetch background image as buffer
    const bgResponse = await axios.get(event.badgeTemplate.backgroundImageUrl, { responseType: 'arraybuffer' });
    const bgBuffer = Buffer.from(bgResponse.data);

    for (const guest of event.guests) {
      // For each guest, we could use Sharp to composite the text/photo on the bg
      // But for now, we'll just add the background and simple text via jsPDF
      // as server-side compositing of arbitrary zones is complex.
      
      if (y + badgeH > 280) {
        doc.addPage();
        x = margin;
        y = margin;
      }

      // Add background
      const bgBase64 = bgBuffer.toString('base64');
      doc.addImage(bgBase64, 'PNG', x, y, badgeW, badgeH);

      // Add guest name (assuming the first TEXT zone is for the name)
      const zones = JSON.parse(event.badgeTemplate.zones || '[]');
      const nameZone = zones.find(z => z.type === 'TEXT');
      if (nameZone) {
        doc.setTextColor(nameZone.color || '#000000');
        doc.setFontSize(nameZone.fontSize || 12);
        const textX = x + (nameZone.x * badgeW) / 100;
        const textY = y + (nameZone.y * badgeH) / 100 + (nameZone.fontSize / 2); // approximate
        doc.text(guest.name, textX, textY);
      }

      x += badgeW + spacing;
      if (x + badgeW > 200) {
        x = margin;
        y += badgeH + spacing;
      }
    }

    const pdfOutput = doc.output('arraybuffer');
    return new Response(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="badges_${event.name}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation error:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du PDF' }, { status: 500 });
  }
}
