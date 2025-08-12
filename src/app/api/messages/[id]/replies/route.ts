import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: messageId } = await params

    // Récupérer toutes les réponses au message
    const replies = await prisma.message.findMany({
      where: {
        replyToId: messageId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Formater les réponses
    const formattedReplies = replies.map(reply => ({
      id: reply.id,
      content: reply.content,
      authorId: reply.authorId,
      authorName: reply.author.name,
      authorAvatar: reply.author.avatar || undefined,
      timestamp: reply.createdAt,
      likes: reply.likes || 0,
      isLiked: false, // À implémenter si nécessaire
      replies: 0, // Les réponses aux réponses ne sont pas implémentées pour l'instant
      shares: 0,
      isShared: false,
      replyToId: reply.replyToId,
      replyToAuthor: reply.replyToAuthor
    }))

    return NextResponse.json(formattedReplies)
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
