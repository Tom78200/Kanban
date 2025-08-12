'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'due_date' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  tasks: any[]
}

export default function NotificationPanel({ isOpen, onClose, tasks }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Générer des notifications basées sur les tâches
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = []
      
      tasks.forEach((task, index) => {
        // Notification de création de tâche
        newNotifications.push({
          id: `task-created-${task.id}`,
          type: 'task_created',
          title: 'New Task Created',
          message: `Task "${task.title}" has been created`,
          timestamp: new Date(task.createdAt),
          read: false
        })

        // Notification si tâche assignée
        if (task.assignee) {
          newNotifications.push({
            id: `task-assigned-${task.id}`,
            type: 'task_assigned',
            title: 'Task Assigned',
            message: `Task "${task.title}" assigned to ${task.assignee}`,
            timestamp: new Date(task.createdAt),
            read: false
          })
        }

        // Notification si tâche terminée
        if (task.status === 'done') {
          newNotifications.push({
            id: `task-completed-${task.id}`,
            type: 'task_completed',
            title: 'Task Completed',
            message: `Task "${task.title}" has been completed`,
            timestamp: new Date(task.createdAt),
            read: false
          })
        }
      })

      // Ajouter quelques notifications système
      newNotifications.push({
        id: 'system-1',
        type: 'system',
        title: 'System Update',
        message: 'TaskMaster has been updated with new features',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 heures ago
        read: true
      })

      setNotifications(newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    }

    generateNotifications()
  }, [tasks])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created': return '📝'
      case 'task_completed': return '✅'
      case 'task_assigned': return '👤'
      case 'due_date': return '⏰'
      case 'system': return '🔧'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_created': return '#3b82f6'
      case 'task_completed': return '#10b981'
      case 'task_assigned': return '#f59e0b'
      case 'due_date': return '#ef4444'
      case 'system': return '#6b7280'
      default: return '#374151'
    }
  }

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || (filter === 'unread' && !notif.read)
  )

  const unreadCount = notifications.filter(notif => !notif.read).length

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
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      zIndex: 1000,
      padding: '80px 24px 24px 24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '600px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#000000' }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '500'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Filtres */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: filter === 'all' ? '#3b82f6' : '#f3f4f6',
              color: filter === 'all' ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: filter === 'unread' ? '#3b82f6' : '#f3f4f6',
              color: filter === 'unread' ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Unread ({unreadCount})
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                marginLeft: 'auto'
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Liste des notifications */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              No notifications
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: notification.read ? 'white' : '#eff6ff',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => markAsRead(notification.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read ? '#f9fafb' : '#dbeafe'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#eff6ff'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '20px',
                    color: getNotificationColor(notification.type)
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: notification.read ? '400' : '600',
                      color: '#000000',
                      marginBottom: '4px'
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9ca3af'
                    }}>
                      {notification.timestamp.toLocaleString()}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                {!notification.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '16px',
                    right: '16px'
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 