'use client'

import { useState } from 'react'

interface FilterOptions {
  searchTerm: string
  status: 'all' | 'todo' | 'doing' | 'done'
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  dueDate: 'all' | 'overdue' | 'today' | 'thisWeek' | 'thisMonth'
  hasComments: boolean
  hasAttachments: boolean
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  assignees: string[]
}

export default function AdvancedFilters({ filters, onFiltersChange, assignees }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: 'all',
      priority: 'all',
      assignee: '',
      dueDate: 'all',
      hasComments: false,
      hasAttachments: false
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== '' && value !== false
  )

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          🔍 Recherche et Filtres
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Effacer
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? 'Masquer' : 'Filtres avancés'}
          </button>
        </div>
      </div>

      {/* Recherche principale */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Rechercher dans les titres, descriptions, assignés..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          {/* Statut */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="doing">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>

          {/* Priorité */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Priorité
            </label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="all">Toutes les priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Assigné */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Assigné
            </label>
            <select
              value={filters.assignee}
              onChange={(e) => updateFilter('assignee', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="">Tous les assignés</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          {/* Date d'échéance */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Date d'échéance
            </label>
            <select
              value={filters.dueDate}
              onChange={(e) => updateFilter('dueDate', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="all">Toutes les dates</option>
              <option value="overdue">En retard</option>
              <option value="today">Aujourd'hui</option>
              <option value="thisWeek">Cette semaine</option>
              <option value="thisMonth">Ce mois</option>
            </select>
          </div>

          {/* Options supplémentaires */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#374151',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={filters.hasComments}
                onChange={(e) => updateFilter('hasComments', e.target.checked)}
                style={{ width: '14px', height: '14px' }}
              />
              Avec commentaires
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#374151',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={filters.hasAttachments}
                onChange={(e) => updateFilter('hasAttachments', e.target.checked)}
                style={{ width: '14px', height: '14px' }}
              />
              Avec pièces jointes
            </label>
          </div>
        </div>
      )}

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#0369a1'
        }}>
          <strong>Filtres actifs :</strong>
          {filters.status !== 'all' && ` Statut: ${filters.status}`}
          {filters.priority !== 'all' && ` Priorité: ${filters.priority}`}
          {filters.assignee && ` Assigné: ${filters.assignee}`}
          {filters.dueDate !== 'all' && ` Date: ${filters.dueDate}`}
          {filters.hasComments && ' Avec commentaires'}
          {filters.hasAttachments && ' Avec pièces jointes'}
        </div>
      )}
    </div>
  )
}



