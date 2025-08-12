'use client'

import { useState, useEffect } from 'react'

interface Project {
  id: string
  name: string
  description?: string
  color: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  ownerId: string
  members?: Array<{ id: string; name: string; email: string }>
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { memberIds?: string[] }) => void
  project?: Project | null
}

export default function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [isPublic, setIsPublic] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [userQuery, setUserQuery] = useState('')

  const isEditing = !!project

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setColor(project.color)
      setIsPublic(project.isPublic)
      setSelectedUserIds(project.members?.map(m => m.id) || [])
    } else {
      setName('')
      setDescription('')
      setColor('#3b82f6')
      setIsPublic(false)
      setSelectedUserIds([])
    }
  }, [project])

  // Charger tous les utilisateurs
  useEffect(() => {
    if (isOpen) {
      fetch('/api/users')
        .then(r => r.json())
        .then(setAllUsers)
        .catch(() => {})
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Le nom du projet est requis')
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        isPublic,
        ownerId: project?.ownerId || '',
        memberIds: selectedUserIds
      })
      onClose()
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const colorOptions = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ]

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
        backgroundColor: 'var(--card-bg, white)',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-color, #000000)' }}>
            {isEditing ? 'Modifier le projet' : 'Créer un nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-color, #666)'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-color, #000000)' }}>
              Nom du projet *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color, #ddd)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'var(--input-bg, white)',
                color: 'var(--text-color, #000000)'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-color, #000000)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color, #ddd)',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                backgroundColor: 'var(--input-bg, white)',
                color: 'var(--text-color, #000000)'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-color, #000000)' }}>
              Couleur
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: colorOption,
                    border: color === colorOption ? '3px solid var(--text-color, #000)' : '2px solid var(--border-color, #ddd)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-color, #000000)' }}>Projet public</span>
            </label>
          </div>

          {/* Sélection des membres */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-color, #000000)' }}>
              Membres du projet
            </label>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Rechercher des utilisateurs..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-color, #ddd)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'var(--input-bg, white)',
                color: 'var(--text-color, #000000)',
                marginBottom: '12px'
              }}
            />
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid var(--border-color, #ddd)',
              borderRadius: '8px',
              padding: '8px'
            }}>
              {allUsers
                .filter(user => 
                  user.name.toLowerCase().includes(userQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(userQuery.toLowerCase())
                )
                .map(user => (
                  <label key={user.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px', 
                    borderBottom: '1px solid var(--border-color, #ddd)', 
                    cursor: 'pointer',
                    backgroundColor: selectedUserIds.includes(user.id) ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                  }}>
                    <span>
                      {user.name} <span style={{ opacity: 0.6, fontSize: '12px' }}>({user.email})</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => setSelectedUserIds(prev => 
                        prev.includes(user.id) 
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id]
                      )}
                    />
                  </label>
                ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

