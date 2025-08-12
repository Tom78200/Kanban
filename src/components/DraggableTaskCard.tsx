'use client'

import { useState, useRef } from 'react'
import { Task } from '@prisma/client'
import UserAvatar from './UserAvatar'

interface DraggableTaskCardProps {
  task: Task
  status: 'todo' | 'doing' | 'done'
  onStatusChange?: (taskId: string, newStatus: 'todo' | 'doing' | 'done') => void
  onEdit?: (task: Task) => void
  index: number
}

export default function DraggableTaskCard({ task, status, onStatusChange, onEdit, index }: DraggableTaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const dragImageRef = useRef<HTMLElement | null>(null)

  // Configuration des couleurs par statut
  const statusConfig = {
    todo: {
      borderColor: '#fecaca',
      bgColor: '#fef2f2',
      dotColor: '#ef4444'
    },
    doing: {
      borderColor: '#fed7aa',
      bgColor: '#fffbeb',
      dotColor: '#f59e0b'
    },
    done: {
      borderColor: '#bbf7d0',
      bgColor: '#f0fdf4',
      dotColor: '#10b981'
    }
  }

  const config = statusConfig[status]

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('taskId', task.id)
    e.dataTransfer.setData('currentStatus', status)
    e.dataTransfer.setData('taskIndex', index.toString())
    e.dataTransfer.effectAllowed = 'move'

    // Drag image pleine (pas transparente) et centrée
    if (e.dataTransfer.setDragImage && cardRef.current) {
      const source = cardRef.current
      const rect = source.getBoundingClientRect()
      const dragImage = source.cloneNode(true) as HTMLElement
      dragImage.style.opacity = '1'
      dragImage.style.transform = 'none'
      dragImage.style.position = 'fixed'
      dragImage.style.top = '-1000px'
      dragImage.style.left = '-1000px'
      dragImage.style.width = `${rect.width}px`
      dragImage.style.height = `${rect.height}px`
      dragImage.style.pointerEvents = 'none'
      dragImage.style.boxShadow = '0 12px 28px rgba(0,0,0,0.25)'
      document.body.appendChild(dragImage)
      dragImageRef.current = dragImage
      e.dataTransfer.setDragImage(dragImage, Math.floor(rect.width / 2), Math.floor(rect.height / 2))
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    e.dataTransfer.clearData()
    if (dragImageRef.current && dragImageRef.current.parentNode) {
      dragImageRef.current.parentNode.removeChild(dragImageRef.current)
      dragImageRef.current = null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      case 'urgent': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Basse'
      case 'medium': return 'Moyenne'
      case 'high': return 'Haute'
      case 'urgent': return 'Urgente'
      default: return priority
    }
  }



  return (
    <div 
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        backgroundColor: 'var(--task-card-bg)', 
        border: '1px solid var(--task-card-border)', 
        borderRadius: '8px',
        color: 'var(--task-card-text)',
        padding: '16px',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging 
          ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
          : isHovered 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transform: isDragging 
          ? 'scale(1.02)' 
          : isHovered 
            ? 'translateY(-2px)' 
            : 'translateY(0)',
        visibility: isDragging ? 'hidden' : 'visible',
        position: 'relative',
        marginBottom: '8px'
      }}
      className={`task-card ${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
    >
      {/* Indicateur de statut */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '8px',
        height: '8px',
        backgroundColor: config.dotColor,
        borderRadius: '50%',
        transition: 'all 0.3s ease'
      }} className="status-indicator" />
      
      {/* Bouton d'édition */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '24px',
            height: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#6b7280',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.1)' : 'scale(0.9)'
          }}
          className="edit-btn hover-lift"
        >
          ✏️
        </button>
      )}
      
      {/* Titre */}
      <h3 style={{ 
        fontSize: '14px', 
        margin: '0 0 8px 0', 
        color: 'var(--task-card-text)',
        fontWeight: '500',
        lineHeight: '1.5',
        paddingRight: onEdit ? '16px' : '0',
        transition: 'color 0.3s ease'
      }}>
        {task.title}
      </h3>
      
      {/* Description */}
      {task.description && (
        <p style={{
          fontSize: '12px',
          color: 'var(--task-card-text)',
          margin: '0 0 8px 0',
          lineHeight: '1.4',
          opacity: 0.8,
          transition: 'opacity 0.3s ease'
        }}>
          {task.description}
        </p>
      )}
      
      {/* Métadonnées */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '11px',
        color: 'var(--task-card-text)',
        transition: 'all 0.3s ease'
      }} className="task-metadata">

        {/* Priorité */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.3s ease'
        }} className="priority-indicator hover-lift">
          <span>🎯</span>
          <span style={{
            color: 'var(--task-card-text)',
            fontWeight: '500'
          }}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>

        {/* Assigné */}
        {task.assigneeId && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.3s ease'
          }} className="assignee-info hover-lift">
            <span>👤</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-color)',
              opacity: 0.8
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: (task as any).assignee?.avatar 
                  ? `url(${(task as any).assignee.avatar}) center/cover`
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }} className="assignee-avatar">
                {(task as any).assignee?.avatar ? '' : ((task as any).assignee?.name?.charAt(0) || '?').toUpperCase()}
              </div>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>
                {(task as any).assignee?.name || 'Utilisateur inconnu'}
              </span>
            </div>
          </div>
        )}

        {/* Date d'échéance */}
        {task.dueDate && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.3s ease'
          }} className="due-date-info hover-lift">
            <span>📅</span>
            {new Date(task.dueDate).toLocaleDateString('fr-FR')}
          </div>
        )}
      </div>

      {/* Indicateur de drag */}
      <div style={{
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        fontSize: '10px',
        color: 'var(--task-card-text)',
        opacity: isHovered ? 1 : 0,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }} className="drag-indicator">
        ⋮⋮
      </div>

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        .task-card {
          position: relative;
          overflow: hidden;
        }
        
        .task-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
          transition: left 0.6s ease;
        }
        
        .task-card:hover::before {
          left: 100%;
        }
        
        .status-indicator {
          animation: pulse 2s infinite;
        }
        
        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          border-color: #3b82f6 !important;
          color: #3b82f6 !important;
        }
        
        .priority-indicator:hover {
          transform: translateX(2px);
        }
        
        .assignee-info:hover {
          transform: translateX(2px);
        }
        
        .due-date-info:hover {
          transform: translateX(2px);
        }
        
        .assignee-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .drag-indicator {
          cursor: grab;
        }
        
        .task-card.dragging {
          animation: none;
        }
        
        .task-card.hovered {
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        /* Animation d'apparition */
        .task-card {
          animation: fadeInUp 0.6s ease-out;
        }
        
        /* Effet de focus pour l'accessibilité */
        .task-card:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}

