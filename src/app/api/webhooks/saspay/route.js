import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';
import { verifySasPayWebhookSignature, verifyTransaction } from '@/lib/saspay';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const reqHeaders = await headers();

    const signature = reqHeaders.get('x-webhook-signature') || '';
    const timestamp = reqHeaders.get('x-webhook-timestamp') || '';
    const eventType = reqHeaders.get('x-webhook-event') || '';

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.SASPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = verifySasPayWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        console.warn('SasPay Webhook: Signature invalide rejetée', { signature, timestamp });
        return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
      }
    } else {
      console.warn('SasPay Webhook: SASPAY_WEBHOOK_SECRET non configuré dans .env, vérification ignorée en dev');
    }

    let payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error('SasPay Webhook: Impossible de parser le JSON', parseErr);
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    const { event, data } = payload;
    const finalEvent = event || eventType;

    console.log(`[SasPay Webhook] Événement reçu : ${finalEvent}`, data?.id || '');

    // 1. Test event
    if (finalEvent === 'webhook.test') {
      return NextResponse.json({
        received: true,
        message: 'SasPay Webhook test reçu avec succès !',
      });
    }

    // 2. Successful Transaction
    if (finalEvent === 'transaction.success' && data) {
      const dbUrl = process.env.DATABASE_URL || '';
      const useNeon = dbUrl.includes('neon.tech');
      const sql = useNeon ? neon(dbUrl) : null;

      // Extract transaction details
      const txnId = data.id;
      const reference = data.reference || txnId;
      const amount = parseFloat(data.amount || data.charged || 0);
      const netAmount = parseFloat(data.net_amount || amount);
      const fee = parseFloat(data.fee || 0);

      // Fetch transaction metadata from SasPay if not directly in data
      let metadata = data.metadata || {};
      if (!metadata || Object.keys(metadata).length === 0) {
        try {
          const detailedTxn = await verifyTransaction(txnId);
          if (detailedTxn?.metadata) {
            metadata = detailedTxn.metadata;
          }
        } catch (fetchErr) {
          console.warn('[SasPay Webhook] Impossible de récupérer les métadonnées de la transaction :', fetchErr?.message);
        }
      }

      // CASE A: User Subscription Upgrade
      if (metadata.type === 'SUBSCRIPTION' && metadata.userId) {
        const { userId, planId = 'premium' } = metadata;
        const now = new Date();
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days

        console.log(`[SasPay Webhook] Activation abonnement pour User ${userId} au plan ${planId}`);

        if (useNeon) {
          // Check if subscription exists
          const existing = await sql`SELECT id FROM "Subscription" WHERE "userId" = ${userId} LIMIT 1`;
          if (existing.length > 0) {
            await sql`
              UPDATE "Subscription"
              SET "planId" = ${planId}, status = 'ACTIVE', "startDate" = ${now}, "endDate" = ${endDate}
              WHERE "userId" = ${userId}
            `;
          } else {
            const subId = uuidv4();
            await sql`
              INSERT INTO "Subscription" (id, "userId", "planId", status, "startDate", "endDate")
              VALUES (${subId}, ${userId}, ${planId}, 'ACTIVE', ${now}, ${endDate})
            `;
          }

          // Add activity log
          const logId = uuidv4();
          await sql`
            INSERT INTO activity_logs (id, "userId", action, details, "createdAt")
            VALUES (${logId}, ${userId}, 'SUBSCRIPTION_ACTIVATED_SASPAY', ${JSON.stringify({ planId, txnId, amount })}, NOW())
          `;
        } else {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              planId,
              status: 'ACTIVE',
              startDate: now,
              endDate: endDate,
            },
            create: {
              userId,
              planId,
              status: 'ACTIVE',
              startDate: now,
              endDate: endDate,
            },
          });

          await prisma.activityLog.create({
            data: {
              userId,
              action: 'SUBSCRIPTION_ACTIVATED_SASPAY',
              details: JSON.stringify({ planId, txnId, amount }),
            },
          });
        }

        return NextResponse.json({ received: true, action: 'SUBSCRIPTION_ACTIVATED' });
      }

      // CASE B: Paid Event Guest Registration
      if (metadata.type === 'EVENT_REGISTRATION' && metadata.guestId) {
        const { guestId, eventId } = metadata;

        console.log(`[SasPay Webhook] Validation paiement invité ${guestId} pour événement ${eventId}`);

        if (useNeon) {
          // Update Guest status to PAID
          await sql`
            UPDATE "Guest"
            SET status = 'PAID', "transactionRef" = ${reference}
            WHERE id = ${guestId}
          `;

          // Check if payment record exists
          const existingPayment = await sql`SELECT id FROM "Payment" WHERE "guestId" = ${guestId} LIMIT 1`;
          if (existingPayment.length > 0) {
            await sql`
              UPDATE "Payment"
              SET status = 'CONFIRMED', amount = ${amount}, "netAmount" = ${netAmount}, commission = ${fee}, "transactionRef" = ${reference}
              WHERE "guestId" = ${guestId}
            `;
          } else {
            const paymentId = uuidv4();
            await sql`
              INSERT INTO "Payment" (id, "guestId", "eventId", amount, commission, "netAmount", status, "transactionRef", "createdAt")
              VALUES (${paymentId}, ${guestId}, ${eventId}, ${amount}, ${fee}, ${netAmount}, 'CONFIRMED', ${reference}, NOW())
            `;
          }
        } else {
          await prisma.guest.update({
            where: { id: guestId },
            data: {
              status: 'PAID',
              transactionRef: reference,
            },
          });

          await prisma.payment.upsert({
            where: { guestId },
            update: {
              status: 'CONFIRMED',
              amount,
              netAmount,
              commission: fee,
              transactionRef: reference,
            },
            create: {
              guestId,
              eventId: eventId,
              amount,
              commission: fee,
              netAmount,
              status: 'CONFIRMED',
              transactionRef: reference,
            },
          });
        }

        return NextResponse.json({ received: true, action: 'GUEST_PAYMENT_CONFIRMED' });
      }

      // If no matching metadata, we still acknowledge receipt
      console.log('[SasPay Webhook] Transaction réussie enregistrée sans metadata spécifique');
      return NextResponse.json({ received: true, action: 'RECORDED' });
    }

    // 3. Failed or Cancelled Transaction
    if (finalEvent === 'transaction.failed' || finalEvent === 'transaction.cancelled') {
      console.log(`[SasPay Webhook] Transaction échouée ou annulée : ${data?.id}`);
      return NextResponse.json({ received: true, status: finalEvent });
    }

    // Default acknowledgement
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[SasPay Webhook] Erreur serveur interne :', error);
    // Returning 200 prevents SasPay from repeating delivery endlessly on application logic errors
    return NextResponse.json({ received: true, error: error?.message }, { status: 200 });
  }
}
