import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    // Provide secret explicitly so Edge runtime doesn't rely on env implicit resolution
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projets/:path*',
    '/equipes/:path*',
    '/profile/:path*',
    '/preferences/:path*'
  ]
} 