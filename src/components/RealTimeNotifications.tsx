'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface RealTimeNotificationsProps {
  isOpen: boolean
  onClose: () => void
}

export default function RealTimeNotifications({ isOpen, onClose }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simuler des notifications temps réel
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'warning' : Math.random() > 0.5 ? 'success' : 'info',
        title: getRandomTitle(),
        message: getRandomMessage(),
        timestamp: new Date(),
        read: false
      }
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Garder max 10 notifications
      setUnreadCount(prev => prev + 1)
    }, 30000) // Nouvelle notification toutes les 30 secondes

    return () => clearInterval(interval)
  }, [])

  const getRandomTitle = () => {
    const titles = [
      'Nouvelle tâche assignée',
      'Tâche terminée',
      'Commentaire ajouté',
      'Date d\'échéance approche',
      'Projet mis à jour'
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  const getRandomMessage = () => {
    const messages = [
      'Une nouvelle tâche vous a été assignée',
      'Félicitations ! Une tâche a été terminée',
      'Un commentaire a été ajouté sur une tâche',
      'Attention : une date d\'échéance approche',
      'Le projet a été mis à jour avec succès'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#3b82f6'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes}min`
    if (minutes < 1440) return `Il y a ${Math.floor(minutes / 60)}h`
    return date.toLocaleDateString('fr-FR')
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            🔔 Notifications ({unreadCount} non lues)
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Tout marquer comme lu
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        <div style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '0'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                Aucune notification
              </div>
              <div style={{ fontSize: '14px' }}>
                Les nouvelles notifications apparaîtront ici
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'white' : '#f0f9ff',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read ? '#f9fafb' : '#e0f2fe'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f0f9ff'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {notification.message}
                    </div>
                    
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: getTypeColor(notification.type),
                        borderRadius: '50%',
                        marginTop: '8px'
                      }} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}




