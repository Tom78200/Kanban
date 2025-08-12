import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***EXISTS***' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasUrl: !!process.env.NEXTAUTH_URL
  })
}

