import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Supprimer un chat (seulement pour le propriétaire de l'équipe)
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

    // Seul le propriétaire peut supprimer le chat
    if (chat.team.ownerId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Supprimer d'abord tous les messages du chat
    await prisma.teamMessage.deleteMany({
      where: { chatId: id }
    })

    // Puis supprimer le chat
    await prisma.teamChat.delete({
      where: { id }
    })

    // Si c'était le dernier chat de l'équipe, supprimer aussi l'équipe
    const remainingChats = await prisma.teamChat.findMany({
      where: { teamId: chat.team.id }
    })

    if (remainingChats.length === 0) {
      // Supprimer tous les membres de l'équipe
      await prisma.teamMember.deleteMany({
        where: { teamId: chat.team.id }
      })

      // Supprimer l'équipe
      await prisma.team.delete({
        where: { id: chat.team.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


