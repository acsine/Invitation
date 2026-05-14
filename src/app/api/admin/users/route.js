import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user.role === 'ADMIN';
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { events: true } },
      subscription: { include: { plan: true } },
      parent: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(users);
}

export async function POST(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { name, email, password, role, parentId } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'ORGANIZER',
      parentId
    }
  });

  return NextResponse.json(user);
}

export async function PATCH(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id, role, parentId, name } = await request.json();
  const user = await prisma.user.update({ 
    where: { id }, 
    data: { role, parentId, name } 
  });
  return NextResponse.json(user);
}

export async function DELETE(request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
