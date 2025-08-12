'use client'

import { useState } from 'react'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  currentProject: any
}

export default function AddTaskModal({ isOpen, onClose, onSave, currentProject }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Le titre de la tâche est requis')
      return
    }

    if (!currentProject?.id) {
      alert('Veuillez sélectionner un projet')
      return
    }

    setIsLoading(true)
    try {
      const newTask = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
        actualHours: 0,

        projectId: currentProject.id

      }

      await onSave(newTask)
      onClose()
      // Reset form
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus('todo')
      setDueDate('')
      setEstimatedHours('')
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsLoading(false)
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
            Créer une nouvelle tâche
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
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>



          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="todo">To Do</option>
              <option value="doing">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Priorité
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Date d'échéance
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Heures estimées
            </label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              min="0"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
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
              {isLoading ? 'Création...' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 