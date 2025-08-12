import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Ajouter un membre au projet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est propriétaire du projet
    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ajouter le membre
    await prisma.project.update({
      where: { id },
      data: {
        members: {
          connect: { id: userId }
        }
      }
    })

    // Récupérer l'utilisateur actuel pour la notification
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Créer une notification pour l'utilisateur ajouté
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'PROJECT_ADDED',
        title: 'Ajouté à un projet',
        message: `Vous avez été ajouté au projet "${project.name}"`,
        data: {
          projectId: id,
          projectName: project.name,
          addedBy: currentUser?.name || 'Utilisateur'
        },
        read: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding project member:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Supprimer un membre du projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est propriétaire du projet
    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.owner.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ne pas permettre de supprimer le propriétaire
    if (userId === project.owner.id) {
      return NextResponse.json({ error: 'Cannot remove project owner' }, { status: 400 })
    }

    // Supprimer le membre - utiliser set pour éviter les problèmes de relation
    const currentMembers = await prisma.user.findMany({
      where: { projects: { some: { id } } },
      select: { id: true }
    })
    
    const updatedMemberIds = currentMembers
      .filter(member => member.id !== userId)
      .map(member => ({ id: member.id }))
    
    await prisma.project.update({
      where: { id },
      data: {
        members: {
          set: updatedMemberIds
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing project member:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
