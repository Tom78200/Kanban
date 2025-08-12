'use client'

import { useState, useEffect } from 'react'
import { MockUser } from '@/lib/mockUsers'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Partial<MockUser>) => void
  currentUser: MockUser
}

export default function ProfileEditModal({ isOpen, onClose, onSave, currentUser }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    bio: currentUser.bio || '',
    avatar: currentUser.avatar || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentUser.name,
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || ''
      })
    }
  }, [isOpen, currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFormData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
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
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            margin: 0
          }}>
            Modifier le profil
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-color)',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: formData.avatar ? 'transparent' : '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '40px',
              fontWeight: 'bold',
              margin: '0 auto 16px auto',
              border: '3px solid var(--border-color)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('avatar-input')?.click()}
            >
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                formData.name.charAt(0).toUpperCase()
              )}
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                border: '2px solid var(--card-bg)'
              }}>
                📷
              </div>
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <p style={{
              color: 'var(--text-color)',
              fontSize: '14px',
              opacity: 0.7,
              margin: 0
            }}>
              Cliquez pour changer l'avatar
            </p>
          </div>

          {/* Nom */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-color)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)'
              }}
              placeholder="Votre nom"
              required
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-color)',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
                fontFamily: 'inherit'
              }}
              placeholder="Parlez-nous de vous..."
              maxLength={160}
            />
            <div style={{
              textAlign: 'right',
              marginTop: '4px',
              fontSize: '12px',
              color: 'var(--text-color)',
              opacity: 0.7
            }}>
              {formData.bio.length}/160
            </div>
          </div>

          {/* Boutons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: isLoading || !formData.name.trim() ? '#6b7280' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading || !formData.name.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !formData.name.trim() ? 0.6 : 1
              }}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


