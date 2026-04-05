import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db, COLLECTIONS } from './firebase';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if it's an admin login (using id field as email)
        const adminSnapshot = await db
          .collection(COLLECTIONS.ADMIN)
          .where('id', '==', credentials.email)
          .limit(1)
          .get();

        if (!adminSnapshot.empty) {
          const adminDoc = adminSnapshot.docs[0];
          const admin = adminDoc.data() as { id: string; pass: string };

          const isPasswordValid = await compare(credentials.password, admin.pass);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: adminDoc.id,
            email: admin.id,
            role: 'admin',
          };
        }

        // Check regular user login
        const usersSnapshot = await db
          .collection(COLLECTIONS.USERS)
          .where('email', '==', credentials.email)
          .limit(1)
          .get();

        if (usersSnapshot.empty) {
          return null;
        }

        const userDoc = usersSnapshot.docs[0];
        const user = userDoc.data() as { email: string; pass: string };

        const isPasswordValid = await compare(credentials.password, user.pass);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: userDoc.id,
          email: user.email,
          role: 'user',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
};