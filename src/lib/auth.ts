import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Avoid NEXTAUTH_URL warnings in dev and when running behind proxies
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar || undefined
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Créer un nouvel utilisateur
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                avatar: user.image,
                role: 'USER'
              }
            })
            user.id = newUser.id
          } else {
            user.id = existingUser.id
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: hydrate token from user
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.avatar = (user as any).avatar
        token.name = user.name
      }

      // Client-side session update: persist changed fields into the JWT
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if ((session as any).avatar !== undefined) token.avatar = (session as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || session.user.role
        session.user.avatar = (token.avatar as string) || session.user.avatar
        session.user.name = (token.name as string) || session.user.name
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
} 