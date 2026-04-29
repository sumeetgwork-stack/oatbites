import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await findUserByEmail(credentials.email);
        if (!user || !user.password) {
          return null;
        }
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          return null;
        }
        return {
          id: user.id || user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await findUserByEmail(user.email);
        if (!existing) {
          await createUser({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user?.email) {
        const dbUser = await findUserByEmail(session.user.email);
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.id = dbUser.id || dbUser._id.toString();
        } else {
          session.user.role = session.user.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
});
