'use client'

import { useEffect, useRef, useState } from 'react'
import ProjectModal from './ProjectModal'

interface Project {
  id: string
  name: string
  description?: string
  color: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

interface ProjectSelectorProps {
  projects: Project[]
  currentProject: Project | null
  onProjectChange: (project: Project) => void
  onProjectCreate?: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  onProjectUpdate?: (project: Project) => void
  onProjectDelete?: (projectId: string) => void
}

export default function ProjectSelector({ 
  projects, 
  currentProject, 
  onProjectChange, 
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: currentProject?.color || '#3b82f6'
        }} />
        <span style={{ color: '#374151' }}>
          {currentProject?.name || 'Select Project'}
        </span>
        <svg style={{ width: '12px', height: '12px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={popoverRef} style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          minWidth: '200px',
          zIndex: 1000
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
              Projects
            </div>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  borderBottom: '1px solid #f9fafb',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  // Afficher les boutons d'action au survol
                  const actionButtons = e.currentTarget.querySelector('[data-action-buttons]') as HTMLElement
                  if (actionButtons) {
                    actionButtons.style.opacity = '1'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  // Masquer les boutons d'action quand on quitte
                  const actionButtons = e.currentTarget.querySelector('[data-action-buttons]') as HTMLElement
                  if (actionButtons) {
                    actionButtons.style.opacity = '0'
                  }
                }}
              >
                <button
                  onClick={() => {
                    onProjectChange(project)
                    setIsOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: project.color
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', color: '#374151' }}>
                      {project.name}
                    </div>
                    {project.description && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {project.description}
                      </div>
                    )}
                  </div>
                  {project.isPublic && (
                    <div style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '4px'
                    }}>
                      Public
                    </div>
                  )}
                </button>
                
                {/* Menu d'actions */}
                <div 
                  data-action-buttons
                  style={{
                    display: 'flex',
                    gap: '4px',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.9))',
                    padding: '2px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid var(--border-color, #e5e7eb)'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingProject(project)
                      setIsModalOpen(true)
                      setIsOpen(false)
                    }}
                    style={{
                      padding: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      color: 'var(--text-color, #6b7280)',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg, #f3f4f6)'
                      e.currentTarget.style.color = 'var(--text-color, #374151)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-color, #6b7280)'
                    }}
                    title="Modifier le projet"
                  >
                    ✏️
                  </button>
                  {onProjectDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cette action supprimera également toutes les tâches associées.`)) {
                          onProjectDelete(project.id)
                          setIsOpen(false)
                        }
                      }}
                      style={{
                        padding: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: '#ef4444',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                        e.currentTarget.style.color = '#dc2626'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#ef4444'
                      }}
                      title="Supprimer le projet"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={() => {
                setEditingProject(null)
                setIsModalOpen(true)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px dashed #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              + Créer un nouveau projet
            </button>
          </div>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProject(null)
        }}
        onSave={async (projectData) => {
          if (editingProject) {
            // Update existing project
            const updatedProject = { ...editingProject, ...projectData }
            if (onProjectUpdate) {
              await onProjectUpdate(updatedProject)
            }
          } else {
            // Create new project
            if (onProjectCreate) {
              await onProjectCreate(projectData)
            }
          }
        }}
        project={editingProject}
        isEditing={!!editingProject}
      />
    </div>
  )
} 