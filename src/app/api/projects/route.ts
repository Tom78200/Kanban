import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TEMPORAIRE: Utiliser un utilisateur par défaut si pas de session
    let userId = session?.user?.id
    if (!userId) {
      console.log('No session, using default user')
      // Créer ou récupérer un utilisateur par défaut
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

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
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
      // Créer ou récupérer un utilisateur par défaut
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

    const { name, description, color, isPublic, memberIds } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        isPublic: isPublic || false,
        ownerId: userId,
        members: {
          connect: memberIds ? memberIds.map((id: string) => ({ id })) : []
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { id, name, description, color, isPublic } = await request.json()

    if (!id || !name) {
      return NextResponse.json(
        { message: 'Project ID and name are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        color: color || '#3b82f6',
        isPublic: isPublic || false
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Supprimer d'abord toutes les tâches du projet
    await prisma.task.deleteMany({
      where: { projectId }
    })

    // Puis supprimer le projet
    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 