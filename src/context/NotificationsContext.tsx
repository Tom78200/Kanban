"use client"
import React, { createContext, useContext, useMemo, useState } from 'react'

export type AppNotification = {
  id: string
  key?: string
  title: string
  message: string
  timestamp: number
  read: boolean
  count?: number
}

type NotificationsContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { key?: string }) => void
  upsertNotification: (key: string, data: { title: string; message: string }) => void
  markAllRead: () => void
  removeNotification: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const addNotification: NotificationsContextValue['addNotification'] = (n) => {
    if (n.key) {
      setNotifications(prev => {
        const idx = prev.findIndex(p => p.key === n.key)
        if (idx >= 0) {
          const updated = [...prev]
          const existing = updated[idx]
          updated[idx] = { ...existing, title: n.title, message: n.message, timestamp: Date.now(), read: false, count: (existing.count ?? 1) + 1 }
          return updated
        }
        return [
          { id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`, key: n.key, title: n.title, message: n.message, timestamp: Date.now(), read: false, count: 1 },
          ...prev
        ]
      })
      return
    }
    setNotifications(prev => [
      { id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`, title: n.title, message: n.message, timestamp: Date.now(), read: false },
      ...prev
    ])
  }

  const upsertNotification: NotificationsContextValue['upsertNotification'] = (key, data) => {
    addNotification({ key, title: data.title, message: data.message })
  }

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))

  const value = useMemo(() => ({ notifications, unreadCount, addNotification, upsertNotification, markAllRead, removeNotification }), [notifications, unreadCount])
  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}


