'use client'

import { Task } from '@prisma/client'

interface DashboardStatsProps {
  tasks: Task[]
  currentProject: any
}

export default function DashboardStats({ tasks, currentProject }: DashboardStatsProps) {
  const totalTasks = tasks.length
  const todoTasks = tasks.filter(task => task.status === 'todo').length
  const doingTasks = tasks.filter(task => task.status === 'doing').length
  const doneTasks = tasks.filter(task => task.status === 'done').length
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  ).length

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const stats = [
    {
      title: 'Total',
      value: totalTasks,
      color: '#3b82f6',
      icon: '📊'
    },
    {
      title: 'À faire',
      value: todoTasks,
      color: '#ef4444',
      icon: '📋'
    },
    {
      title: 'En cours',
      value: doingTasks,
      color: '#f59e0b',
      icon: '⚡'
    },
    {
      title: 'Terminées',
      value: doneTasks,
      color: '#10b981',
      icon: '✅'
    },
    {
      title: 'Priorité haute',
      value: highPriorityTasks,
      color: '#dc2626',
      icon: '🚨'
    },
    {
      title: 'En retard',
      value: overdueTasks,
      color: '#ef4444',
      icon: '⏰'
    }
  ]

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
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          📈 Statistiques du projet
        </h3>
        {currentProject && (
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {currentProject.name}
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Progression globale
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#10b981'
          }}>
            {completionRate}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${completionRate}%`,
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Grille de statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        {stats.map((stat) => (
          <div key={stat.title} style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: `1px solid ${stat.color}20`
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '8px'
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: stat.color,
              marginBottom: '4px'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Informations supplémentaires */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#0369a1',
          marginBottom: '8px'
        }}>
          💡 Conseils
        </div>
        <div style={{
          fontSize: '12px',
          color: '#0369a1',
          lineHeight: '1.4'
        }}>
          {overdueTasks > 0 && (
            <div>• {overdueTasks} tâche(s) en retard - priorité à traiter</div>
          )}
          {highPriorityTasks > 0 && (
            <div>• {highPriorityTasks} tâche(s) haute priorité à surveiller</div>
          )}
          {todoTasks > 10 && (
            <div>• Beaucoup de tâches en attente - considérez déléguer</div>
          )}
          {completionRate > 80 && (
            <div>• Excellent taux de completion ! 🎉</div>
          )}
          {completionRate < 30 && (
            <div>• Taux de completion faible - revoyez la planification</div>
          )}
        </div>
      </div>
    </div>
  )
}




