'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Preferences() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskUpdates: true,
    projectUpdates: true,
    weeklyReport: false
  })

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedNotifications = localStorage.getItem('notifications')
    
    setDarkMode(savedDarkMode)
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }

    // Appliquer le mode sombre
    applyDarkMode(savedDarkMode)
  }, [])

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    applyDarkMode(newDarkMode)
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value }
    setNotifications(newNotifications)
    localStorage.setItem('notifications', JSON.stringify(newNotifications))
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      // Ici tu ferais un appel API pour sauvegarder les préférences
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
      alert('Préférences sauvegardées avec succès !')
    } catch (error) {
      alert('Erreur lors de la sauvegarde des préférences')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-color, #f9fafb)',
      color: 'var(--text-color, #000000)',
      padding: '20px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color, #e5e7eb)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color, #e5e7eb)'
        }}>
          <Link href="/profile" style={{
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Retour au profil
          </Link>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'var(--text-color, #000000)',
            margin: 0
          }}>
            Préférences
          </h1>
        </div>

        {/* Mode sombre */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-color, #374151)',
            marginBottom: '16px'
          }}>
            Apparence
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px',
            backgroundColor: 'var(--bg-color, #f9fafb)',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #e5e7eb)'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: 'var(--text-color, #374151)',
                marginBottom: '4px'
              }}>
                Mode sombre
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                margin: 0
              }}>
                Basculer entre le thème clair et sombre
              </p>
            </div>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '34px'
            }}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: darkMode ? '#3b82f6' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '26px',
                  width: '26px',
                  left: '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                  transform: darkMode ? 'translateX(26px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-color, #374151)',
            marginBottom: '16px'
          }}>
            Notifications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--bg-color, #f9fafb)',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #e5e7eb)'
              }}>
                <div>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    color: 'var(--text-color, #374151)',
                    marginBottom: '4px'
                  }}>
                    {key === 'email' && 'Notifications par email'}
                    {key === 'push' && 'Notifications push'}
                    {key === 'taskUpdates' && 'Mises à jour des tâches'}
                    {key === 'projectUpdates' && 'Mises à jour des projets'}
                    {key === 'weeklyReport' && 'Rapport hebdomadaire'}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {key === 'email' && 'Recevoir des notifications par email'}
                    {key === 'push' && 'Recevoir des notifications push dans le navigateur'}
                    {key === 'taskUpdates' && 'Être notifié des changements de statut des tâches'}
                    {key === 'projectUpdates' && 'Être notifié des mises à jour de projet'}
                    {key === 'weeklyReport' && 'Recevoir un rapport hebdomadaire par email'}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: value ? '#3b82f6' : '#ccc',
                    transition: '0.4s',
                    borderRadius: '24px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.4s',
                      borderRadius: '50%',
                      transform: value ? 'translateX(26px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color, #e5e7eb)'
        }}>
          <button
            onClick={handleSavePreferences}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
          </button>
          
          <Link href="/dashboard" style={{
            padding: '12px 24px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 
 
 