'use client'

import { useState } from 'react'
import { Task } from '@prisma/client'

interface ListViewProps {
  tasks: Task[]
  onStatusChange: (taskId: string, newStatus: 'todo' | 'doing' | 'done') => void
  onTaskEdit?: (task: Task) => void
}

export default function ListView({ tasks, onStatusChange, onTaskEdit }: ListViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'doing' | 'done'>('all')
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'createdAt'>('createdAt')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrer et trier les tâches
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (task.assigneeId && task.assigneeId.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#ef4444'
      case 'doing': return '#f59e0b'
      case 'done': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return '📋'
      case 'doing': return '⚡'
      case 'done': return '✅'
      default: return '📄'
    }
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      {/* Filtres et recherche */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'todo' | 'doing' | 'done')}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '120px'
          }}
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="doing">In Progress</option>
          <option value="done">Done</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'title' | 'status' | 'createdAt')}
          style={{
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '120px'
          }}
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>To Do</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
            {tasks.filter(t => t.status === 'todo').length}
          </div>
        </div>
        
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fed7aa'
        }}>
          <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>In Progress</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
            {tasks.filter(t => t.status === 'doing').length}
          </div>
        </div>
        
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>Done</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
            {tasks.filter(t => t.status === 'done').length}
          </div>
        </div>
        
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Total</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
            {tasks.length}
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAndSortedTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            No tasks found matching your criteria
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{getStatusIcon(task.status)}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', margin: 0 }}>
                    {task.title}
                  </h3>
                </div>
                
                {task.description && (
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
                    {task.description}
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  {task.assigneeId && <span>Assignee: {task.assigneeId}</span>}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: `${getStatusColor(task.status)}20`,
                  color: getStatusColor(task.status),
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {task.status}
                </span>
                
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as 'todo' | 'doing' | 'done')}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="doing">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 