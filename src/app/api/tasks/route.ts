import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TEMPORAIRE: Utiliser un utilisateur par défaut si pas de session
    let userId = session?.user?.id
    if (!userId) {
      console.log('No session, using default user')
      const defaultUser = await prisma.user.findFirst({
        where: { email: 'default@example.com' }
      })
      
      if (!defaultUser) {
        const newUser = await prisma.user.create({
          data: {
            email: 'default@example.com',
            name: 'Utilisateur Test',
            role: 'USER'
          }
        })
        userId = newUser.id
      } else {
        userId = defaultUser.id
      }
    }

    const body = await request.json()
    const { title, description, status, priority, dueDate, projectId } = body

    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and projectId are required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId,
        createdById: userId,
        assigneeId: userId // Par défaut, l'utilisateur qui crée la tâche
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
} 