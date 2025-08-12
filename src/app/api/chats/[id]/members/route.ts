import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Ajouter un membre au chat
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

    // Vérifier que l'utilisateur est membre du chat
    const chat = await prisma.teamChat.findUnique({
      where: { id },
      include: { 
        team: { 
          include: { 
            members: true,
            owner: true
          } 
        } 
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est membre de l'équipe ou propriétaire
    const isMember = chat.team.members.some(m => m.userId === currentUser.id)
    const isOwner = chat.team.ownerId === currentUser.id

    if (!isMember && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ajouter le membre à l'équipe
    await prisma.teamMember.create({
      data: {
        teamId: chat.team.id,
        userId: userId,
        role: 'MEMBER'
      }
    })

    // Créer une notification pour l'utilisateur ajouté
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'CHAT_ADDED',
        title: 'Ajouté à une conversation',
        message: `Vous avez été ajouté à la conversation "${chat.name}"`,
        data: {
          chatId: id,
          chatName: chat.name,
          addedBy: currentUser.name
        },
        read: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding chat member:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Supprimer un membre du chat
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

    // Vérifier que l'utilisateur est propriétaire de l'équipe
    const chat = await prisma.teamChat.findUnique({
      where: { id },
      include: { 
        team: { 
          include: { 
            owner: true 
          } 
        } 
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Seul le propriétaire peut supprimer des membres
    if (chat.team.ownerId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Ne pas permettre de supprimer le propriétaire
    if (userId === chat.team.ownerId) {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 })
    }

    // Supprimer le membre directement
    await prisma.teamMember.deleteMany({
      where: {
        teamId: chat.team.id,
        userId: userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing chat member:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
