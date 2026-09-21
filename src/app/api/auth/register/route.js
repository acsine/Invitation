import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const dbUrl = process.env.DATABASE_URL || '';

    // Check existing user via Neon HTTPS (port 443) or Prisma fallback
    let existingUser = null;
    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      const existing = await sql`SELECT id FROM "User" WHERE email = ${normalizedEmail}`;
      if (existing.length > 0) existingUser = existing[0];
    } else {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const userId = crypto.randomUUID();
    const now = new Date();

    if (dbUrl.includes('neon.tech')) {
      const sql = neon(dbUrl);
      await sql`INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") VALUES (${userId}, ${normalizedEmail}, ${name.trim()}, ${hashedPassword}, 'ORGANIZER', ${now}, ${now})`;
    } else {
      await prisma.user.create({
        data: {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({ message: 'Utilisateur créé' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
