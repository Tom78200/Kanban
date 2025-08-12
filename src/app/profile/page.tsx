'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/context/UserContext'

export default function Profile() {
  const { data: session, update } = useSession()
  const { updateUser } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Synchroniser les données avec la session ET le UserContext
  useEffect(() => {
    if (session?.user && !isInitialized) {
      // Utiliser les données du UserContext si disponibles, sinon la session
      const userContext = JSON.parse(localStorage.getItem('taskmaster_user') || '{}')
      setAvatar(userContext.avatar || session.user.avatar || '')
      setName(userContext.name || session.user.name || '')
      setEmail(session.user.email || '')
      setIsInitialized(true)
    }
  }, [session, isInitialized])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const result = event.target?.result as string
      const img = new window.Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 100
        canvas.height = 100
        if (ctx) {
          ctx.drawImage(img, 0, 0, 100, 100)
          let quality = 0.5
          let compressedAvatar = ''
          let size = 0
          do {
            compressedAvatar = canvas.toDataURL('image/jpeg', quality)
            size = Math.round((compressedAvatar.length * 3) / 4) - (compressedAvatar.endsWith('==') ? 2 : compressedAvatar.endsWith('=') ? 1 : 0)
            quality -= 0.1
          } while (size > 500 * 1024 && quality >= 0.1)
          if (size > 500 * 1024) {
            alert('Impossible de compresser l\'image sous 500KB. Choisissez une image plus simple.')
            e.target.value = ''
            return
          }

          try {
            // Upload via API interne
            const uploadRes = await fetch('/api/user/upload-avatar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: compressedAvatar })
            })
            const uploadData = await uploadRes.json()
            if (!uploadRes.ok || !uploadData.url) {
              alert('Erreur lors de l\'upload: ' + (uploadData?.error || ''))
              return
            }
            setAvatar(uploadData.url)
          } catch (err) {
            alert('Erreur lors de l\'upload de l\'avatar')
            return
          }
        }
      }
      img.src = result
    }
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier')
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert('Le nom ne peut pas être vide !')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), avatar }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      const data = await response.json()

      await update({
        name: data.user.name,
        avatar: data.user.avatar,
      } as any)

      updateUser({
        name: data.user.name,
        avatar: data.user.avatar,
      })

      const currentUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
        role: session?.user?.role || 'user'
      }
      localStorage.setItem('taskmaster_user', JSON.stringify(currentUser))

      // Refresh session
      await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' })

      alert('Profil mis à jour avec succès !')
      router.refresh()

    } catch (error: any) {
      console.error('Erreur:', error)
      alert(`Erreur lors de la mise à jour du profil: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      alert('Erreur lors de la suppression du compte')
      setIsDeleting(false)
    }
  }

  // Redirection si pas connecté
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, router])

  if (!session) {
    return null
  }

  // Écran de loader pendant la sauvegarde
  if (isLoading) {
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
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'var(--card-bg)',
          padding: '32px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{
            color: 'var(--text-color)',
            fontSize: '16px',
            fontWeight: '500',
            margin: 0
          }}>
            Sauvegarde en cours...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      padding: '20px',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Link href="/dashboard" style={{
            color: 'var(--nav-text)',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Retour au dashboard
          </Link>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'var(--text-color)',
            margin: 0
          }}>
            Mon Profil
          </h1>
        </div>

        {/* Photo de profil */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-color)',
            marginBottom: '16px'
          }}>
            Photo de profil
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid var(--border-color)'
            }}>
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ 
                  fontSize: '32px', 
                  color: 'var(--nav-text)',
                  fontWeight: 'bold'
                }}>
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '8px'
                }}
              >
                Changer la photo
              </button>
              <p style={{ 
                fontSize: '12px', 
                color: 'var(--nav-text)',
                margin: 0
              }}>
                JPG, PNG ou GIF. Max 500KB.
              </p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-color)',
            marginBottom: '16px'
          }}>
            Informations personnelles
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-color)',
                marginBottom: '8px'
              }}>
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)'
                }}
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--text-color)',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--nav-text)'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: 'var(--nav-text)',
                marginTop: '4px'
              }}>
                L'email ne peut pas être modifié
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={handleSaveProfile}
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
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
          
          <Link href="/preferences" style={{
            padding: '12px 24px',
            backgroundColor: 'var(--button-secondary)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            Préférences
          </Link>
        </div>

        {/* Section suppression de compte */}
        <div style={{ 
          marginTop: '48px',
          padding: '24px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#dc2626',
            marginBottom: '8px'
          }}>
            Zone dangereuse
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--nav-text)',
            marginBottom: '16px'
          }}>
            Une fois votre compte supprimé, toutes vos données seront définitivement perdues.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Supprimer mon compte
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--nav-text)' }}>
                Êtes-vous sûr ? Cette action est irréversible.
              </span>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
 
 