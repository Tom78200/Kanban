'use client'

import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '../context/UserContext'
import { NotificationsProvider } from '../context/NotificationsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationsProvider>
        <UserProvider>{children}</UserProvider>
      </NotificationsProvider>
    </SessionProvider>
  )
} 