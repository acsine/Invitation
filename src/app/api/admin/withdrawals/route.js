import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user.role === 'ADMIN';
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(withdrawals);
}

export async function PATCH(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id, status } = await request.json();
  const withdrawal = await prisma.withdrawalRequest.update({ 
    where: { id }, 
    data: { status } 
  });
  return NextResponse.json(withdrawal);
}
