import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: messageId } = await params

    // Récupérer le message pour vérifier l'auteur
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            email: true
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur connecté est l'auteur du message
    if (message.author.email !== session.user.email) {
      return NextResponse.json({ error: 'Non autorisé à supprimer ce message' }, { status: 403 })
    }

    // Supprimer le message
    await prisma.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: messageId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })

    // Like (crée l’entrée si absente)
    await prisma.messageLike.upsert({
      where: { userId_messageId: { userId: user.id, messageId } },
      update: {},
      create: { userId: user.id, messageId }
    })

    // Met à jour le compteur likes (optionnel, peut être calculé via count)
    const likes = await prisma.messageLike.count({ where: { messageId } })
    await prisma.message.update({ where: { id: messageId }, data: { likes } })

    return NextResponse.json({ isLiked: true, likes })
  } catch (error) {
    console.error('Erreur like message:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: messageId } = await params
    const body = await request.json().catch(() => ({}))
    const { action } = body
    if (action !== 'unlike') return NextResponse.json({ error: 'Action invalide' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })

    await prisma.messageLike.delete({ where: { userId_messageId: { userId: user.id, messageId } } }).catch(() => {})
    const likes = await prisma.messageLike.count({ where: { messageId } })
    await prisma.message.update({ where: { id: messageId }, data: { likes } })
    return NextResponse.json({ isLiked: false, likes })
  } catch (error) {
    console.error('Erreur unlike message:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

