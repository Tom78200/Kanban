'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { validateAdminPassword } from '@/lib/admin-config'

export default function ClearDatabasePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClearing, setIsClearing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(true)

  // Rediriger si pas connecté
  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Chargement...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/api/auth/signin')
    return null
  }

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateAdminPassword(adminPassword)) {
      setIsAuthenticated(true)
      setShowPasswordForm(false)
      setError(null)
    } else {
      setError('Mot de passe admin incorrect')
      setAdminPassword('')
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm('⚠️ ATTENTION ! Cette action va supprimer TOUTES les données de la base de données. Êtes-vous absolument sûr ?')) {
      return
    }

    if (!confirm('🔴 DERNIÈRE CHANCE : Toutes les utilisateurs, messages, projets, tâches et équipes seront définitivement supprimés. Continuer ?')) {
      return
    }

    setIsClearing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/clear-database', {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push('/api/auth/signout')
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du nettoyage')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsClearing(false)
    }
  }

  // Formulaire d'authentification admin
  if (showPasswordForm) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '40px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            marginBottom: '20px'
          }}>
            🔐 Accès Administrateur
          </h1>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: '#92400e',
              margin: '0 0 10px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ⚠️ Zone Restreinte
            </h3>
            <p style={{
              color: '#92400e',
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              Cette page permet d'accéder aux fonctions d'administration sensibles.
              <br />
              <strong>Accès réservé aux administrateurs uniquement.</strong>
            </p>
          </div>

          <form onSubmit={handleAdminAuth} style={{ width: '100%' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: 'var(--text-color)',
                textAlign: 'left'
              }}>
                Mot de passe administrateur :
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)'
                }}
                placeholder="Entrez le mot de passe admin"
                required
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              🔐 Se connecter
            </button>
          </form>

          <button
            onClick={() => router.push('/')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  // Page de nettoyage de la base de données (après authentification)
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            margin: 0
          }}>
            🗑️ Nettoyage de la Base de Données
          </h1>
          <button
            onClick={() => {
              setIsAuthenticated(false)
              setShowPasswordForm(true)
              setAdminPassword('')
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280'
            }}
          >
            🔓 Déconnexion
          </button>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#92400e',
            margin: '0 0 10px 0',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ⚠️ ATTENTION - Action Irréversible
          </h3>
          <p style={{
            color: '#92400e',
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Cette action va supprimer <strong>TOUTES</strong> les données de l'application :
            utilisateurs, messages, projets, tâches, équipes, notifications, etc.
            <br /><br />
            <strong>Cette action ne peut pas être annulée !</strong>
          </p>
        </div>

        {!isClearing && !result && (
          <button
            onClick={handleClearDatabase}
            style={{
              padding: '16px 32px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            🗑️ SUPPRIMER TOUTES LES DONNÉES
          </button>
        )}

        {isClearing && (
          <div style={{
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #f59e0b'
          }}>
            <h3 style={{
              color: '#92400e',
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🧹 Nettoyage en cours...
            </h3>
            <p style={{
              color: '#92400e',
              margin: 0,
              fontSize: '14px'
            }}>
              Veuillez patienter pendant que nous supprimons toutes les données...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#fee2e2',
            borderRadius: '12px',
            border: '1px solid #ef4444'
          }}>
            <h3 style={{
              color: '#dc2626',
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ❌ Erreur
            </h3>
            <p style={{
              color: '#dc2626',
              margin: 0,
              fontSize: '14px'
            }}>
              {error}
            </p>
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#dcfce7',
            borderRadius: '12px',
            border: '1px solid #22c55e'
          }}>
            <h3 style={{
              color: '#166534',
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ✅ Base de données nettoyée avec succès !
            </h3>
            <div style={{
              color: '#166534',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              <p><strong>Données supprimées :</strong></p>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>👥 {result.deleted.users} utilisateurs</li>
                <li>💬 {result.deleted.messages} messages</li>
                <li>📁 {result.deleted.projects} projets</li>
                <li>✅ {result.deleted.tasks} tâches</li>
                <li>👥 {result.deleted.teams} équipes</li>
                <li>🔔 {result.deleted.notifications} notifications</li>
              </ul>
              <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
                Redirection vers la page de connexion dans quelques secondes...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
