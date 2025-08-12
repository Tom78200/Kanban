import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Créer un utilisateur par défaut s'il n'existe pas
    let user = await prisma.user.findFirst({
      where: { email: 'default@example.com' }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'default@example.com',
          name: 'Utilisateur Test',
          role: 'USER'
        }
      })
    }

    // Créer un projet par défaut s'il n'existe pas
    let project = await prisma.project.findFirst({
      where: { name: 'Projet Test' }
    })

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Projet Test',
          description: 'Projet pour tester le chronomètre automatique',
          color: '#3b82f6',
          isPublic: false,
          ownerId: user.id
        }
      })
    }

    // Créer des tâches de test avec des dates anciennes
    const now = new Date()
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Tâche qui devrait passer en "doing" (créée il y a 15 jours)
    await prisma.task.create({
      data: {
        title: 'Tâche ancienne en todo',
        description: 'Cette tâche a été créée il y a 15 jours et devrait passer en "En cours"',
        status: 'todo',
        priority: 'medium',
        projectId: project.id,
        createdById: user.id,
        createdAt: fifteenDaysAgo,
        updatedAt: fifteenDaysAgo
      }
    })

    // Tâche qui devrait passer en "done" (en cours depuis 30 jours)
    await prisma.task.create({
      data: {
        title: 'Tâche ancienne en cours',
        description: 'Cette tâche est en cours depuis 30 jours et devrait passer en "Terminé"',
        status: 'doing',
        priority: 'high',
        projectId: project.id,
        createdById: user.id,
        createdAt: thirtyDaysAgo,
        updatedAt: thirtyDaysAgo
      }
    })

    // Tâche récente pour comparaison
    await prisma.task.create({
      data: {
        title: 'Tâche récente',
        description: 'Cette tâche a été créée récemment',
        status: 'todo',
        priority: 'low',
        projectId: project.id,
        createdById: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Données de test initialisées avec succès',
      project: project,
      tasksCreated: 3
    })
  } catch (error) {
    console.error('Error initializing test data:', error)
    return NextResponse.json(
      { error: 'Failed to initialize test data' },
      { status: 500 }
    )
  }
}

