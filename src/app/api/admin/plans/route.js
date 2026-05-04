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
  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
  return NextResponse.json(plans);
}

export async function POST(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const data = await request.json();
  const plan = await prisma.plan.create({ data });
  return NextResponse.json(plan);
}

export async function PUT(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id, ...data } = await request.json();
  const plan = await prisma.plan.update({ where: { id }, data });
  return NextResponse.json(plan);
}

export async function DELETE(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
