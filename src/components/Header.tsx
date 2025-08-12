'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useUser } from '../context/UserContext'
import { useNotifications } from '../context/NotificationsContext'

export default function Header() {
  const { data: session } = useSession()
  const { user, setUser } = useUser()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { notifications, unreadCount, markAllRead, removeNotification } = useNotifications()

  useEffect(() => {
    if (session?.user) {
              setUser({
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          avatar: (session.user as any).avatar || (session.user as any).image || undefined
        })
    }
  }, [session, setUser])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationPanelOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const navItems = [
    { href: '/dashboard', label: 'Accueil' },
    { href: '/projets', label: 'Projets' },
    { href: '/equipes', label: 'Équipes' }
  ]

  return (
    <header style={{
      backgroundColor: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo complètement à gauche */}
        <Link href="/dashboard" style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--text-color)',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginRight: '32px'
        }}>
          <span style={{
            fontSize: '28px',
            fontWeight: '800',
            color: 'var(--text-color)'
          }}>
            KanbanApp
          </span>
        </Link>

        {/* Navigation au centre */}
        <nav style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  color: isActive ? 'var(--nav-active)' : 'var(--nav-text)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                className="nav-link"
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    height: '2px',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: '1px',
                    transform: 'scaleX(1)',
                    transition: 'transform 0.3s ease'
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions utilisateur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Icône de notification + panneau */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button 
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                color: 'var(--nav-text)'
              }}
              className="notification-btn"
              aria-label="Notifications"
              aria-expanded={isNotificationPanelOpen}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Indicateur de notification non lue */}
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              )}
            </button>

            {/* Panneau de notifications */}
            {isNotificationPanelOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                width: '320px',
                maxHeight: '400px',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                marginTop: '8px',
                animation: 'slideInFromTop 0.3s ease-out'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%)'
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '16px' }}>Notifications</span>
                  <button 
                    onClick={markAllRead} 
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      padding: '6px 12px', 
                      background: 'transparent', 
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover-lift"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--nav-text)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                      Aucune notification
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      Les nouvelles notifications apparaîtront ici
                    </div>
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ 
                        padding: '16px 20px', 
                        borderBottom: '1px solid var(--border-color)', 
                        background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      className="notification-item hover-lift"
                      onClick={() => removeNotification(n.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px' }}>
                            {n.title}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(n.id)
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--nav-text)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              opacity: 0.6,
                              transition: 'all 0.2s ease'
                            }}
                            className="hover-glow"
                          >
                            ×
                          </button>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--nav-text)', lineHeight: '1.4' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--nav-text)', opacity: 0.6, marginTop: '8px' }}>
                          {new Date(n.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profil utilisateur */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                color: 'var(--text-color)'
              }}
              className="profile-btn hover-lift"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user?.avatar 
                  ? `url(${user.avatar}) center/cover`
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease'
              }}>
                {user?.avatar ? '' : (user?.name?.charAt(0) || '?').toUpperCase()}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{user?.name || 'Utilisateur'}</span>
              <svg 
                width="16" 
                height="16" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{
                  transition: 'transform 0.2s ease',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu déroulant */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                width: '200px',
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                marginTop: '8px',
                animation: 'slideInFromTop 0.3s ease-out',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '8px 0',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(29, 78, 216, 0.05) 100%)'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-color)'
                  }}>
                    {user?.email || 'email@example.com'}
                  </div>
                </div>
                
                {/* Lien Modifier le profil */}
                <Link href="/profile" style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-color)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border-color)'
                }}
                className="hover-lift"
                onClick={() => setIsDropdownOpen(false)}
                >
                  <span style={{ marginRight: '8px' }}>👤</span>
                  Modifier le profil
                </Link>
                
                {/* Lien Préférences */}
                <Link href="/preferences" style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-color)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border-color)'
                }}
                className="hover-lift"
                onClick={() => setIsDropdownOpen(false)}
                >
                  <span style={{ marginRight: '8px' }}>⚙️</span>
                  Préférences
                </Link>
                
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#ef4444',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  className="hover-lift"
                >
                  <span>🚪</span>
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles CSS personnalisés pour les animations */}
      <style jsx>{`
        .nav-link {
          position: relative;
          overflow: hidden;
        }
        
        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.6s ease;
        }
        
        .nav-link:hover::before {
          left: 100%;
        }
        
        .nav-link:active {
          transform: scale(0.98) translateY(-1px);
        }
        
        /* Animation pour l'élément actif */
        .nav-link.active {
          background: rgba(59, 130, 246, 0.1);
        }
        
        /* Effet de focus pour l'accessibilité */
        .nav-link:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Animation de la barre active */
        .nav-link > div {
          transform-origin: left;
        }
        
        /* Hover effect pour tous les éléments de navigation */
        .nav-link:hover {
          background: rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </header>
  )
}