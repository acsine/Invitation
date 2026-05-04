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
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { events: true } },
      subscription: { include: { plan: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(users);
}

export async function PATCH(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id, role } = await request.json();
  const user = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json(user);
}

export async function DELETE(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
