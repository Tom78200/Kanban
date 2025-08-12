import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
}

const handler = NextAuth({
  ...authOptions,
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'
})

export { handler as GET, handler as POST } 