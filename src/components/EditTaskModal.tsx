'use client'

import { useState, useEffect } from 'react'
import { Task } from '@prisma/client'

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: string, updatedTask: Partial<Task>) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  task: Task | null
}

export default function EditTaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task
}: EditTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [actualHours, setActualHours] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
      setEstimatedHours(task.estimatedHours?.toString() || '')
      setActualHours(task.actualHours?.toString() || '')
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setIsLoading(true)
    try {
      await onSave(task.id, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        actualHours: actualHours ? parseFloat(actualHours) : null
      })
      onClose()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      setIsLoading(true)
      try {
        await onDelete(task.id)
        onClose()
      } catch (error) {
        console.error('Error deleting task:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!isOpen || !task) return null

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
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>
            Modifier la tâche
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'todo' | 'doing' | 'done')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="todo">À faire</option>
                <option value="doing">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Heures estimées
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                min="0"
                step="0.5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Heures réelles
            </label>
            <input
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value)}
              min="0"
              step="0.5"
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
              onClick={handleDelete}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Supprimer
            </button>
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
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


