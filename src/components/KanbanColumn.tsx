'use client'

import { Task } from '@prisma/client'
import DraggableTaskCard from './DraggableTaskCard'

interface KanbanColumnProps {
  title: string
  status: 'todo' | 'doing' | 'done'
  tasks: Task[]
  onStatusChange?: (taskId: string, newStatus: 'todo' | 'doing' | 'done') => void
  onTaskEdit?: (task: Task) => void
}

export default function KanbanColumn({ title, status, tasks, onStatusChange, onTaskEdit }: KanbanColumnProps) {
  // Configuration des couleurs et icônes par statut
  const columnConfig = {
    todo: {
      color: '#ef4444', // Rouge
      icon: '📋',
      bgColor: '#fef2f2'
    },
    doing: {
      color: '#f59e0b', // Orange
      icon: '⚡',
      bgColor: '#fffbeb'
    },
    done: {
      color: '#10b981', // Vert
      icon: '✅',
      bgColor: '#f0fdf4'
    }
  }

  const config = columnConfig[status]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    const currentStatus = e.dataTransfer.getData('currentStatus')
    
    if (taskId && currentStatus !== status && onStatusChange) {
      onStatusChange(taskId, status)
    }
  }

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--kanban-column-bg)', 
        border: '1px solid var(--kanban-column-border)', 
        borderRadius: '12px',
        color: 'var(--text-color)',
        padding: '20px',
        minHeight: '450px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{config.icon}</span>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: config.color }}>{title}</h2>
        </div>
        <span style={{ 
          fontSize: '12px', 
          color: config.color,
          backgroundColor: config.bgColor,
          padding: '4px 10px',
          borderRadius: '12px',
          fontWeight: '500',
          border: `1px solid ${config.color}20`
        }}>
          {tasks.length}
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.map((task, index) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            status={status}
            onStatusChange={onStatusChange}
            onEdit={onTaskEdit}
            index={index}
          />
        ))}
        
        {tasks.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: 'var(--text-color)', 
            fontSize: '14px',
            border: '2px dashed var(--border-color)',
            borderRadius: '8px',
            backgroundColor: 'var(--kanban-column-bg)'
          }}>
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}