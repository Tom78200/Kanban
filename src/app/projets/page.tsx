'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Task } from '@prisma/client'
import Link from 'next/link'
import KanbanColumn from '@/components/KanbanColumn'
import AddTaskModal from '@/components/AddTaskModal'
import ProjectSelector from '@/components/ProjectSelector'
import EditTaskModal from '@/components/EditTaskModal'
import ListView from '@/components/ListView'
import CalendarView from '@/components/CalendarView'
import Tooltip from '@/components/Tooltip'


export default function Projets() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('board')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  // Filtrer les utilisateurs disponibles
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase())
  ).filter(u => !currentProject?.members?.some((m: any) => m.id === u.id))

  // Ajouter des membres au projet
  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) return;
    
    try {
      // Ajouter chaque utilisateur sélectionné
      for (const userId of selectedUserIds) {
        await fetch(`/api/projects/${currentProject.id}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      }
      
      // Recharger les projets et mettre à jour le projet actuel
      const response = await fetch('/api/projects');
      if (response.ok) {
        const updatedProjects = await response.json();
        setProjects(updatedProjects);
        
        // Mettre à jour le projet actuel avec les nouvelles données
        const updatedCurrentProject = updatedProjects.find((p: any) => p.id === currentProject.id);
        if (updatedCurrentProject) {
          setCurrentProject(updatedCurrentProject);
        }
      }
      
      setShowAddMemberModal(false);
      setSelectedUserIds([]);
      setUserQuery('');
    } catch (error) {
      console.error('Error adding members:', error);
    }
  };

  // Initialiser les tâches vides - elles seront chargées depuis l'API

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        // Sélectionner le premier projet par défaut
        if (data.length > 0 && !currentProject) {
          setCurrentProject(data[0])
        }
      } else {
        console.error('Failed to fetch projects:', response.status)
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTasks = async () => {
    if (!currentProject?.id) {
      setTasks([])
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/tasks?projectId=${currentProject.id}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchProjects()
    }
  }, [session])

  // Créer un projet par défaut si aucun projet n'existe
  useEffect(() => {
    if (session && projects.length === 0 && !isLoading) {
      const createDefaultProject = async () => {
        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Mon Premier Projet',
              description: 'Bienvenue ! Commencez par créer vos premières tâches.',
              color: '#3b82f6',
              isPublic: false
            })
          })
          if (response.ok) {
            const newProject = await response.json()
            setProjects([newProject])
            setCurrentProject(newProject)
            // Créer quelques tâches d'exemple
            await createSampleTasks(newProject.id)
          }
        } catch (error) {
          console.error('Error creating default project:', error)
        }
      }
      
      // Attendre un peu avant de créer le projet par défaut
      const timer = setTimeout(createDefaultProject, 1000)
      return () => clearTimeout(timer)
    }
  }, [session, projects.length, isLoading])

  useEffect(() => {
    if (currentProject) {
      fetchTasks()
    }
  }, [currentProject])

  const handleAddTask = async (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    if (!currentProject?.id) {
      alert('Veuillez sélectionner un projet')
      return
    }
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask), // newTask contient déjà le projectId
      })

      if (response.ok) {
        const createdTask = await response.json()
        setTasks(prev => [...prev, createdTask])
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Erreur lors de la création de la tâche: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Erreur lors de la création de la tâche')
    }
  }

  const handleProjectCreate = async (projectData: any) => {
    try {
      console.log('Creating project with data:', projectData)
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const newProject = await response.json()
        console.log('Created project:', newProject)
        setProjects(prev => [newProject, ...prev])
        setCurrentProject(newProject)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Erreur lors de la création du projet: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Erreur lors de la création du projet')
    }
  }

  const handleProjectUpdate = async (projectData: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        const updatedProject = await response.json()
        setProjects(prev => 
          prev.map(project => 
            project.id === updatedProject.id ? updatedProject : project
          )
        )
        setCurrentProject(updatedProject)
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleProjectDelete = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Supprimer le projet de la liste
        setProjects(prev => prev.filter(project => project.id !== projectId))
        
        // Si c'était le projet actuel, sélectionner le premier projet disponible
        if (currentProject?.id === projectId) {
          const remainingProjects = projects.filter(project => project.id !== projectId)
          if (remainingProjects.length > 0) {
            setCurrentProject(remainingProjects[0])
          } else {
            setCurrentProject(null)
          }
        }
        
        // Vider les tâches
        setTasks([])
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  const handleTaskUpdate = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      })

      if (response.ok) {
        const updatedTaskData = await response.json()
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, ...updatedTaskData } : task
          )
        )
      } else {
        // Si l'API échoue, mettre à jour localement
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        )
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Mettre à jour localement en cas d'erreur
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      )
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
      } else {
        // Si l'API échoue, supprimer localement
        setTasks(prev => prev.filter(task => task.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      // Supprimer localement en cas d'erreur
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
  }

  // Créer des tâches d'exemple pour le projet par défaut
  const createSampleTasks = async (projectId: string) => {
    const sampleTasks = [
      {
        title: 'Bienvenue ! 👋',
        description: 'Cette est votre première tâche. Cliquez dessus pour l\'éditer.',
        status: 'todo' as const,
        priority: 'medium' as const,
        projectId
      },
      {
        title: 'Explorer l\'interface',
        description: 'Découvrez les différentes vues : Board, List et Calendar.',
        status: 'doing' as const,
        priority: 'high' as const,
        projectId
      },
      {
        title: 'Créer votre première vraie tâche',
        description: 'Utilisez le bouton + pour ajouter vos propres tâches.',
        status: 'done' as const,
        priority: 'low' as const,
        projectId
      }
    ]

    for (const task of sampleTasks) {
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        })
      } catch (error) {
        console.error('Error creating sample task:', error)
      }
    }
    
    // Recharger les tâches
    fetchTasks()
  }



  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        )
      } else {
        // Si l'API échoue, mettre à jour localement
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        )
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      // Mettre à jour localement en cas d'erreur
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
    }
  }



  const filteredTasks = tasks

  const todoTasks = filteredTasks.filter(task => task.status === 'todo')
  const doingTasks = filteredTasks.filter(task => task.status === 'doing')
  const doneTasks = filteredTasks.filter(task => task.status === 'done')

  // Extraire la liste des assignés uniques
  const assignees = Array.from(new Set(tasks.map(task => task.assigneeId).filter((id): id is string => id !== null)))

  if (isLoading) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          border: '3px solid rgba(255,255,255,0.3)', 
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }}></div>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '600' }}>
          Chargement des projets...
        </h2>
        <p style={{ opacity: 0.8, fontSize: '16px' }}>
          Préparation de votre espace de travail
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // État vide avec guide visuel
  if (projects.length === 0) {
    return (
      <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'white',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '64px', 
            marginBottom: '24px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}>
            🚀
          </div>
        <h1 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '700' }}>
          Bienvenue sur TaskMaster Pro !
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.9, maxWidth: '500px' }}>
          Créez votre premier projet pour commencer à organiser vos tâches et collaborer avec votre équipe.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => {
              const name = prompt('Nom de votre premier projet ?', 'Mon Projet')
              if (name) {
                handleProjectCreate({ name, description: 'Description de votre projet', color: '#3b82f6' })
              }
            }}
            style={{
              padding: '16px 32px',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            ✨ Créer mon premier projet
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/init', { method: 'POST' })
                if (response.ok) {
                  window.location.reload()
                }
              } catch (error) {
                console.error('Error initializing:', error)
              }
            }}
            style={{
              padding: '16px 24px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🎯 Charger des exemples
          </button>
        </div>
        <div style={{ 
          marginTop: '48px', 
          padding: '24px', 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          maxWidth: '600px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>
            🎉 Ce que vous pourrez faire :
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <span>Vue Kanban intuitive</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📝</span>
              <span>Gestion des tâches</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <span>Vue calendrier</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>👥</span>
              <span>Collaboration équipe</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(59, 130, 246, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de particules flottantes */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '40px',
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              marginBottom: '16px', 
              color: 'var(--text-color)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🚀 Gestion des Projets
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: 'var(--text-color)', 
              margin: '0 0 24px 0',
              opacity: 0.8,
              fontWeight: '500'
            }}>
              Gérez vos projets et tâches efficacement avec une interface moderne et intuitive
            </p>
          </div>
          
          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginTop: '8px'
          }}>
            {/* Project Selector */}
            <ProjectSelector
              projects={projects}
              currentProject={currentProject}
              onProjectChange={setCurrentProject}
              onProjectCreate={handleProjectCreate}
              onProjectUpdate={handleProjectUpdate}
              onProjectDelete={handleProjectDelete}
            />
          </div>
        </div>

        {/* Statistiques */}
                {/* Informations du projet et membres */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Statistiques du projet */}
          <div style={{
          background: 'linear-gradient(135deg, var(--stats-bg) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--stats-border)',
          color: 'var(--stats-text)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Effet de brillance */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: 'shine 3s ease-in-out infinite',
            pointerEvents: 'none'
          }}></div>
          
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: 'var(--stats-text)', 
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            Statistiques du projet
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '20px' 
          }}>
            
            {/* Barre de progression globale */}
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--stats-text)' }}>Progression globale</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--stats-text)' }}>
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
                  borderRadius: '4px',
                  transition: 'width 1s ease-in-out',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }}></div>
              </div>
            </div>
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', marginBottom: '4px' }}>{tasks.length}</div>
              <div style={{ fontSize: '14px', color: 'var(--stats-text)', fontWeight: '500' }}>Total des tâches</div>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>{tasks.filter(t => t.status === 'todo').length}</div>
              <div style={{ fontSize: '14px', color: 'var(--stats-text)', fontWeight: '500' }}>À faire</div>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '4px' }}>{tasks.filter(t => t.status === 'doing').length}</div>
              <div style={{ fontSize: '14px', color: 'var(--stats-text)', fontWeight: '500' }}>En cours</div>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginBottom: '4px' }}>{tasks.filter(t => t.status === 'done').length}</div>
              <div style={{ fontSize: '14px', color: 'var(--stats-text)', fontWeight: '500' }}>Terminées</div>
            </div>
          </div>
          
          <style jsx>{`
            @keyframes shine {
              0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
              100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div>

        {/* Section des membres */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: 'var(--text-color)', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>👥</span>
              Membres du projet
            </h3>
            
            {/* Bouton pour ajouter des membres */}
            {currentProject && (
              <Tooltip content="Ajouter des membres au projet" position="bottom">
                <button
                  onClick={() => {
                    // Charger tous les utilisateurs
                    fetch('/api/users')
                      .then(r => r.json())
                      .then(setAllUsers)
                      .then(() => setShowAddMemberModal(true))
                      .catch(() => {});
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--text-color)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
                    e.currentTarget.style.borderColor = '#10b981'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                >
                  + Ajouter un membre
                </button>
              </Tooltip>
            )}
          </div>
          
          {currentProject?.members && currentProject.members.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              alignItems: 'start'
            }}>
              {currentProject.members.map((member: { id: string; name: string; email: string; avatar?: string }) => (
                <div key={member.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  position: 'relative',
                  transform: 'none',
                  transformOrigin: 'center',
                  minWidth: 0
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: member.avatar 
                      ? 'transparent'
                      : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-color)', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.email}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: '8px' }}>
                  {currentProject.owner?.id === member.id && (
                    <div style={{
                      padding: '4px 8px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      Propriétaire
                    </div>
                  )}
                  {session?.user?.id === currentProject.owner?.id && currentProject.owner?.id !== member.id && (
                    <Tooltip content="Révoquer l'accès" position="top">
                      <button
                        onClick={async () => {
                          if (confirm(`Révoquer l'accès de ${member.name} ?`)) {
                            try {
                              const response = await fetch(`/api/projects/${currentProject.id}/members?userId=${member.id}`, {
                                method: 'DELETE'
                              })
                              if (response.ok) {
                                // Recharger les projets et mettre à jour le projet actuel
                                const response2 = await fetch('/api/projects');
                                if (response2.ok) {
                                  const updatedProjects = await response2.json();
                                  setProjects(updatedProjects);
                                  
                                  // Mettre à jour le projet actuel avec les nouvelles données
                                  const updatedCurrentProject = updatedProjects.find((p: any) => p.id === currentProject.id);
                                  if (updatedCurrentProject) {
                                    setCurrentProject(updatedCurrentProject);
                                  }
                                }
                              }
                            } catch (error) {
                              console.error('Error removing member:', error)
                            }
                          }
                        }}
                        style={{
                          padding: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        🗑️
                      </button>
                    </Tooltip>
                  )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-color)',
              opacity: 0.6
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Aucun membre ajouté à ce projet
              </p>
            </div>
          )}
        </div>
      </div>
        
        <div style={{ 
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'rgba(59, 130, 246, 0.02)',
          borderRadius: '12px 12px 0 0',
          padding: '0 24px'
        }}>
          <nav style={{ 
            display: 'flex', 
            gap: '32px',
            position: 'relative'
          }}>
            <Tooltip content="Vue Kanban avec colonnes" position="bottom">
              <button
                onClick={() => setActiveTab('board')}
                style={{
                  padding: '12px 4px',
                  borderBottom: activeTab === 'board' ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'board' ? '#3b82f6' : 'var(--text-color)'
                }}
              >
                📊 Board
              </button>
            </Tooltip>
            <Tooltip content="Vue liste des tâches" position="bottom">
              <button
                onClick={() => setActiveTab('list')}
                style={{
                  padding: '12px 4px',
                  borderBottom: activeTab === 'list' ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'list' ? '#3b82f6' : 'var(--text-color)'
                }}
              >
                📝 List
              </button>
            </Tooltip>
            <Tooltip content="Vue calendrier des tâches" position="bottom">
              <button
                onClick={() => setActiveTab('calendar')}
                style={{
                  padding: '12px 4px',
                  borderBottom: activeTab === 'calendar' ? '2px solid #3b82f6' : '2px solid transparent',
                  fontWeight: '500',
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === 'calendar' ? '#3b82f6' : 'var(--text-color)'
                }}
              >
                📅 Calendar
              </button>
            </Tooltip>
          </nav>
        </div>
      </div>

      {activeTab === 'board' && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-color)' }}>Kanban Board</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '16px'
          }}>
            <KanbanColumn
              title="To Do"
              status="todo"
              tasks={todoTasks}
              onStatusChange={handleStatusChange}
              onTaskEdit={handleTaskEdit}
            />
            <KanbanColumn
              title="In Progress"
              status="doing"
              tasks={doingTasks}
              onStatusChange={handleStatusChange}
              onTaskEdit={handleTaskEdit}
            />
            <KanbanColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              onStatusChange={handleStatusChange}
              onTaskEdit={handleTaskEdit}
            />
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-color)' }}>List View</h2>
          <ListView 
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onTaskEdit={handleTaskEdit}
          />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-color)' }}>Calendar View</h2>
          <CalendarView tasks={tasks} />
        </div>
      )}

      {/* Bouton d'ajout flottant coloré */}
      <Tooltip content="Ajouter une nouvelle tâche" position="left">
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.6)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)'
            e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
          }}
        >
          ✨
        </button>
      </Tooltip>

      {/* Modal d'ajout de tâche */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTask}
        currentProject={currentProject}
      />

      {/* Modal d'édition de tâche */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleTaskUpdate}
        onDelete={handleTaskDelete}
        task={editingTask}
      />

      {/* Section commentaires pour la tâche en cours d'édition */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          maxHeight: '80vh',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-color)' }}>Commentaires</h3>
          <p style={{ color: 'var(--text-color)', textAlign: 'center' }}>Fonctionnalité en cours de développement</p>
        </div>
      )}

      {/* Panneau de notifications temps réel */}
      {isNotificationPanelOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 999
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-color)' }}>Notifications</h3>
            <button onClick={() => setIsNotificationPanelOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-color)' }}>×</button>
          </div>
          <p style={{ color: 'var(--text-color)', textAlign: 'center' }}>Fonctionnalité en cours de développement</p>
        </div>
      )}

      {/* Modal d'ajout de membres */}
      {showAddMemberModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }} onClick={() => setShowAddMemberModal(false)}>
          <div style={{ 
            width: 420, 
            maxWidth: '90%', 
            background: 'var(--card-bg)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 12, 
            padding: 16 
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Ajouter des membres</h3>
            <input 
              value={userQuery} 
              onChange={e => setUserQuery(e.target.value)} 
              placeholder="Rechercher des utilisateurs..." 
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 8, 
                border: '1px solid var(--border-color)', 
                background: 'var(--input-bg)', 
                color: 'var(--text-color)' 
              }} 
            />
            <div style={{ 
              maxHeight: 260, 
              overflowY: 'auto', 
              marginTop: 8, 
              border: '1px solid var(--border-color)', 
              borderRadius: 8 
            }}>
              {filteredUsers.length === 0 ? (
                <div style={{ padding: 12, opacity: .7, fontSize: 14 }}>
                  {userQuery ? 'Aucun résultat' : 'Tous les utilisateurs sont déjà membres'}
                </div>
              ) : filteredUsers.map(u => (
                <label key={u.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: 8, 
                  borderBottom: '1px solid var(--border-color)', 
                  cursor: 'pointer' 
                }}>
                  <span>{u.name} <span style={{ opacity: .6, fontSize: 12 }}>({u.email})</span></span>
                  <input 
                    type="checkbox" 
                    checked={selectedUserIds.includes(u.id)} 
                    onChange={() => setSelectedUserIds(prev => 
                      prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                    )} 
                  />
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Tooltip content="Annuler" position="top">
                <button 
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setSelectedUserIds([])
                    setUserQuery('')
                  }} 
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    background: 'transparent', 
                    borderRadius: 8, 
                    padding: '8px 12px', 
                    cursor: 'pointer' 
                  }}
                >
                  Annuler
                </button>
              </Tooltip>
              <Tooltip content={selectedUserIds.length === 0 ? "Sélectionne au moins un utilisateur" : `Ajouter ${selectedUserIds.length} membre(s)`} position="top">
                <button 
                  disabled={selectedUserIds.length === 0} 
                  onClick={handleAddMembers} 
                  style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 8, 
                    padding: '8px 12px', 
                    fontWeight: 600, 
                    cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer', 
                    opacity: selectedUserIds.length === 0 ? 0.6 : 1 
                  }}
                >
                  Ajouter ({selectedUserIds.length})
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
