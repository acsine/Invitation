import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { amount, phone } = await req.json();

    if (!amount || !phone) {
      return NextResponse.json({ error: 'Montant et téléphone requis' }, { status: 400 });
    }

    if (amount < 5000) {
      return NextResponse.json({ error: 'Le montant minimum est de 5000 FCFA' }, { status: 400 });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: session.user.id,
        amount: parseInt(amount),
        status: 'PENDING',
        mobileNumber: phone,
      }
    });

    return NextResponse.json(withdrawal);
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
