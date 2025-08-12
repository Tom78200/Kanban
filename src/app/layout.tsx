import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Header from '@/components/Header'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskMaster Pro - Professional Task Management',
  description: 'Enterprise-grade task management application for teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider />
          <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <Header />
            <main style={{ paddingTop: '0' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}


