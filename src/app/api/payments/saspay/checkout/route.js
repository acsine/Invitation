import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';
import { createCheckoutSession } from '@/lib/saspay';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type = 'SUBSCRIPTION', planId, eventId, guestId, guestName, guestPhone, guestEmail } = body;
    const dbUrl = process.env.DATABASE_URL || '';
    const useNeon = dbUrl.includes('neon.tech');
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://invitation-gamma-azure.vercel.app').replace(/\/+$/, '');

    // 1. Subscription Checkout Flow
    if (type === 'SUBSCRIPTION') {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }

      if (!planId) {
        return NextResponse.json({ error: 'Identifiant de plan requis' }, { status: 400 });
      }

      // Fetch plan from DB
      let plan = null;
      if (useNeon) {
        const sql = neon(dbUrl);
        const rows = await sql`SELECT id, name, price FROM "Plan" WHERE id = ${planId}`;
        plan = rows[0] || null;
      } else {
        plan = await prisma.plan.findUnique({
          where: { id: planId },
          select: { id: true, name: true, price: true }
        });
      }

      // Fallback for default predefined plans if not in DB
      if (!plan) {
        if (planId === 'premium') {
          plan = { id: 'premium', name: 'Premium', price: 10000 };
        } else if (planId === 'free') {
          return NextResponse.json({ error: 'Le plan gratuit ne nécessite aucun paiement' }, { status: 400 });
        } else {
          return NextResponse.json({ error: 'Plan non trouvé' }, { status: 404 });
        }
      }

      if (plan.price <= 0) {
        return NextResponse.json({ error: 'Ce plan est gratuit' }, { status: 400 });
      }

      const returnUrl = `${appUrl}/dashboard/subscription?status=success&plan_id=${encodeURIComponent(plan.id)}`;

      const checkoutData = await createCheckoutSession({
        amount: plan.price,
        description: `Abonnement ${plan.name} - Invitation Manager`,
        customer_email: session.user.email || 'organisateur@invitation.app',
        customer_name: session.user.name || session.user.email || 'Organisateur',
        return_url: returnUrl,
        metadata: {
          type: 'SUBSCRIPTION',
          userId: session.user.id,
          userEmail: session.user.email,
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
        },
      });

      return NextResponse.json({
        checkout_url: checkoutData.checkout_url,
        sessionId: checkoutData.id,
        status: checkoutData.status,
      });
    }

    // 2. Paid Event Registration Flow
    if (type === 'EVENT_REGISTRATION') {
      if (!eventId || !guestId) {
        return NextResponse.json({ error: 'eventId et guestId sont requis' }, { status: 400 });
      }

      // Fetch Event
      let event = null;
      if (useNeon) {
        const sql = neon(dbUrl);
        const rows = await sql`SELECT id, name, "isPaid", price, "shareCode" FROM "Event" WHERE id = ${eventId}`;
        event = rows[0] || null;
      } else {
        event = await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, name: true, isPaid: true, price: true, shareCode: true },
        });
      }

      if (!event) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }

      if (!event.isPaid || event.price <= 0) {
        return NextResponse.json({ error: 'Cet événement est gratuit' }, { status: 400 });
      }

      if (event.price < 200) {
        return NextResponse.json({ 
          error: `Le montant minimum pour un paiement via SasPay est de 200 FCFA (tarif actuel : ${event.price} FCFA). Veuillez modifier le tarif de l'événement.` 
        }, { status: 400 });
      }

      const returnUrl = `${appUrl}/invite/${event.shareCode}?status=paid&guest_id=${encodeURIComponent(guestId)}`;

      const checkoutData = await createCheckoutSession({
        amount: event.price,
        description: `Pass officiel pour : ${event.name}`,
        customer_email: guestEmail || 'invite@invitation.app',
        customer_name: guestName || 'Invité',
        customer_phone: guestPhone || '',
        return_url: returnUrl,
        metadata: {
          type: 'EVENT_REGISTRATION',
          eventId: event.id,
          guestId: guestId,
          guestName: guestName,
          guestPhone: guestPhone,
          amount: event.price,
        },
      });

      return NextResponse.json({
        checkout_url: checkoutData.checkout_url,
        sessionId: checkoutData.id,
        status: checkoutData.status,
      });
    }

    return NextResponse.json({ error: 'Type de paiement non supporté' }, { status: 400 });
  } catch (error) {
    console.error('API /api/payments/saspay/checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
