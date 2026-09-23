import { NextResponse } from 'next/server';
import { getCheckoutSession, verifyTransaction } from '@/lib/saspay';
import prisma from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const transactionId = searchParams.get('transaction_id');

    if (!sessionId && !transactionId) {
      return NextResponse.json({ error: 'session_id ou transaction_id requis' }, { status: 400 });
    }

    let result = null;
    if (sessionId) {
      result = await getCheckoutSession(sessionId);
    } else if (transactionId) {
      result = await verifyTransaction(transactionId);
    }

    return NextResponse.json({
      success: true,
      data: result,
      status: result?.status || 'UNKNOWN',
    });
  } catch (error) {
    console.error('API /api/payments/saspay/verify error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
