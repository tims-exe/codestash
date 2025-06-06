/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { NextAuthOptions, RequestInternal } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyUser } from '../../../../lib/auth'

/**
 * NOTE:
 * - We give `authorize` both parameters (credentials, req).
 * - We add a “username” field to the object we return, because NextAuth’s
 *   built‐in User type in our version requires it.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(
        credentials: Record<'username' | 'password', string> | undefined,
        req: Pick<RequestInternal, 'method' | 'body' | 'query' | 'headers'>
      ) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const result = await verifyUser(
          credentials.username,
          credentials.password
        )

        if (result.success && result.user) {
          // Make sure to include “username” here, because NextAuth’s User
          // interface demands it (at least in your version).
          return {
            id: result.user.id,
            name: result.user.username,
            email: null,
            username: result.user.username, 
          }
        }

        return null
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // If you also want session.user.username available:
        session.user.username = token.username as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
