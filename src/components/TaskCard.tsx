'use client'

import { Task } from '@prisma/client'

interface TaskCardProps {
  task: Task
  status: 'todo' | 'doing' | 'done'
  onStatusChange?: (taskId: string, newStatus: 'todo' | 'doing' | 'done') => void
  onEdit?: (task: Task) => void
}

export default function TaskCard({ task, status, onStatusChange, onEdit }: TaskCardProps) {
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
    e.dataTransfer.setData('taskId', task.id)
    e.dataTransfer.setData('currentStatus', status)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.dataTransfer.clearData()
  }

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ 
        backgroundColor: config.bgColor, 
        border: `1px solid ${config.borderColor}`, 
        borderRadius: '8px',
        padding: '16px',
        cursor: 'grab',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Indicateur de statut */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '8px',
        height: '8px',
        backgroundColor: config.dotColor,
        borderRadius: '50%'
      }} />
      
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
            opacity: 0,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0'
          }}
        >
          ✏️
        </button>
      )}
      
      <h3 style={{ 
        fontSize: '14px', 
        margin: 0, 
        color: '#000000',
        fontWeight: '500',
        lineHeight: '1.5',
        paddingRight: '16px'
      }}>
        {task.title}
      </h3>
      
      {task.description && (
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          margin: '8px 0 0 0',
          lineHeight: '1.4'
        }}>
          {task.description}
        </p>
      )}
      
      {task.assigneeId && (
        <div style={{
          fontSize: '11px',
          color: '#6b7280',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>👤</span>
            {task.assigneeId}
          </div>
        </div>
      )}
    </div>
  )
} 