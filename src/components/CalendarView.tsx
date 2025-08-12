'use client'

import { useState, useEffect } from 'react'
import { Task } from '@prisma/client'

interface CalendarViewProps {
  tasks: Task[]
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Ajouter les jours du mois précédent
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Ajouter les jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }
    
    // Ajouter les jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const days = getDaysInMonth(currentDate)

  // Obtenir les tâches pour une date donnée
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      // Utiliser dueDate (date limite) si disponible, sinon createdAt
      const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  // Obtenir le nombre de tâches par statut pour une date
  const getTaskCountsForDate = (date: Date) => {
    const dayTasks = getTasksForDate(date)
    return {
      todo: dayTasks.filter(task => task.status === 'todo').length,
      doing: dayTasks.filter(task => task.status === 'doing').length,
      done: dayTasks.filter(task => task.status === 'done').length,
      total: dayTasks.length
    }
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      {/* Header du calendrier */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000000' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          style={{
            padding: '8px 16px',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            backgroundColor: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Today
        </button>
      </div>

      {/* Grille du calendrier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
        {/* En-têtes des jours */}
        {dayNames.map(day => (
          <div
            key={day}
            style={{
              padding: '12px',
              backgroundColor: 'white',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            {day}
          </div>
        ))}

        {/* Jours du mois */}
        {days.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString()
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString()
          const dayTasks = getTasksForDate(day.date)
          const taskCounts = getTaskCountsForDate(day.date)
          const hasTasks = dayTasks.length > 0

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day.date)}
              style={{
                minHeight: '120px',
                padding: '8px',
                border: isToday ? '2px solid #3b82f6' : '1px solid #f3f4f6',
                cursor: 'pointer',
                position: 'relative',
                opacity: day.isCurrentMonth ? 1 : 0.5,
                backgroundColor: isSelected ? '#eff6ff' : 'white',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                if (hasTasks) {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? '#3b82f6' : '#374151',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{day.date.getDate()}</span>
                {hasTasks && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    marginLeft: '4px'
                  }} />
                )}
              </div>
              
              {/* Indicateurs de tâches par statut */}
              {hasTasks && (
                <div style={{ 
                  display: 'flex', 
                  gap: '2px', 
                  marginBottom: '4px',
                  justifyContent: 'center'
                }}>
                  {taskCounts.todo > 0 && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%'
                    }} />
                  )}
                  {taskCounts.doing > 0 && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#f59e0b',
                      borderRadius: '50%'
                    }} />
                  )}
                  {taskCounts.done > 0 && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
              )}
              
              {/* Tâches du jour */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dayTasks.slice(0, 2).map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    style={{
                      fontSize: '9px',
                      padding: '2px 4px',
                      backgroundColor: task.status === 'todo' ? '#fef2f2' : 
                                     task.status === 'doing' ? '#fffbeb' : '#f0fdf4',
                      color: task.status === 'todo' ? '#ef4444' : 
                             task.status === 'doing' ? '#f59e0b' : '#10b981',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      border: '1px solid',
                      borderColor: task.status === 'todo' ? '#fecaca' : 
                                  task.status === 'doing' ? '#fed7aa' : '#bbf7d0'
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div style={{
                    fontSize: '9px',
                    color: '#6b7280',
                    textAlign: 'center',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    padding: '1px 2px'
                  }}>
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Détails de la date sélectionnée */}
      {selectedDate && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#000000' }}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {/* Statistiques de la journée */}
          {(() => {
            const dayTasks = getTasksForDate(selectedDate)
            const counts = getTaskCountsForDate(selectedDate)
            return (
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '16px',
                padding: '8px 12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{counts.todo}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>To Do</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>{counts.doing}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>In Progress</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{counts.done}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Done</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>{counts.total}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
                </div>
              </div>
            )
          })()}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {getTasksForDate(selectedDate).map((task, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${
                    task.status === 'todo' ? '#ef4444' : 
                    task.status === 'doing' ? '#f59e0b' : '#10b981'
                  }`
                }}
              >
                <div style={{ fontWeight: '500', fontSize: '14px', color: '#000000' }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {task.description}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Status: {task.status} • {task.assigneeId ? `Assigned to: ${task.assigneeId}` : 'Unassigned'}
                </div>
              </div>
            ))}
            {getTasksForDate(selectedDate).length === 0 && (
              <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
                No tasks for this date
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 