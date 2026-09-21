import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import prisma from './prisma';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const normalizedEmail = credentials.email.trim().toLowerCase();
          const dbUrl = process.env.DATABASE_URL || '';

          let user = null;

          if (dbUrl.includes('neon.tech')) {
            const sql = neon(dbUrl);
            const rows = await sql`SELECT id, email, name, password, role FROM "User" WHERE email = ${normalizedEmail}`;
            if (rows.length > 0) {
              user = rows[0];
            }
          } else {
            user = await prisma.user.findUnique({
              where: { email: normalizedEmail },
              include: { subscription: { include: { plan: true } } },
            });
          }

          if (!user) {
            console.log('NextAuth: User not found in database for email:', normalizedEmail);
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password.trim(), user.password);
          if (!passwordMatch) {
            console.log('NextAuth: Password mismatch for user:', normalizedEmail);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            subscription: user.subscription || null,
          };
        } catch (error) {
          console.error('NextAuth authorize Database Error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const dbUrl = process.env.DATABASE_URL || '';
          const normalizedEmail = user.email?.trim().toLowerCase();
          if (!normalizedEmail) return true;

          if (dbUrl.includes('neon.tech')) {
            const sql = neon(dbUrl);
            const rows = await sql`SELECT id, email, name, role FROM "User" WHERE email = ${normalizedEmail}`;
            if (rows.length === 0) {
              const userId = crypto.randomUUID();
              await sql`
                INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
                VALUES (${userId}, ${normalizedEmail}, ${user.name || 'Utilisateur Google'}, 'USER', NOW(), NOW())
              `;
              user.id = userId;
              user.role = 'USER';
            } else {
              user.id = rows[0].id;
              user.role = rows[0].role || 'USER';
            }
          } else {
            const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
            if (!existingUser) {
              const createdUser = await prisma.user.create({
                data: {
                  email: normalizedEmail,
                  name: user.name || 'Utilisateur Google',
                  role: 'USER',
                },
              });
              user.id = createdUser.id;
              user.role = createdUser.role;
            } else {
              user.id = existingUser.id;
              user.role = existingUser.role;
            }
          }
        } catch (error) {
          console.error('NextAuth Google signIn callback error:', error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'USER';
        token.subscription = user.subscription || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || 'USER';
        session.user.subscription = token.subscription || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
