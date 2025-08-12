import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Créer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { content, image, images, replyToId, replyToAuthor } = body

    // Récupérer l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        image,
        authorId: user.id,
        replyToId,
        replyToAuthor,
        images: images && Array.isArray(images) ? { create: images.slice(0, 2).map((url: string) => ({ url })) } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true }},
        images: true
      }
    })

    // Si c'est une réponse, mettre à jour le compteur de réponses du message parent
    if (replyToId) {
      await prisma.message.update({
        where: { id: replyToId },
        data: {
          likes: {
            increment: 0 // Pas de changement, juste pour déclencher la mise à jour
          }
        }
      })
    }

    // Formater la réponse
    const formattedMessage = {
      id: message.id,
      content: message.content,
      authorId: message.authorId,
      authorName: message.author.name,
      authorAvatar: message.author.avatar,
      image: message.image,
      images: (message as any).images?.map((i: any) => i.url) || [],
      timestamp: message.createdAt,
      likes: 0,
      isLiked: false,
      replies: 0,
      shares: 0,
      isShared: false,
      replyToId: message.replyToId || undefined,
      replyToAuthor: message.replyToAuthor
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error('Erreur lors de la création du message:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Récupérer tous les messages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const url = new URL(request.url)
    const take = Number(url.searchParams.get('take') || '50')
    const cursor = url.searchParams.get('cursor') || undefined
    const q = url.searchParams.get('q')?.toLowerCase() || ''
    const authorId = url.searchParams.get('authorId') || undefined
    const authorName = url.searchParams.get('authorName') || undefined

    // Récupérer les messages avec leurs auteurs (fil principal: sans reply)
    const whereClause: any = {
      replyToId: null // Exclure les réponses du fil principal
    }
    if (q) {
      whereClause.OR = [
        { content: { contains: q } },
        { replyToAuthor: { contains: q } },
        { author: { name: { contains: q } } },
      ]
    }
    if (authorId) {
      whereClause.authorId = authorId
    }
    if (authorName) {
      // filter by author name
      whereClause.author = { name: { contains: authorName } }
    }

    const messages = await prisma.message.findMany({
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        images: true,
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: whereClause,
      take: take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    })

    // Calculer isLiked pour l'utilisateur courant
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    const formattedMessages = await Promise.all(messages.map(async (message) => {
      const isLiked = currentUser ? !!(await prisma.messageLike.findFirst({ where: { userId: currentUser.id, messageId: message.id } })) : false
      return {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        authorName: message.author.name,
        authorAvatar: message.author.avatar,
        image: message.image,
        images: (message as any).images?.map((i: any) => i.url) || [],
        timestamp: message.createdAt,
        likes: message.likes || 0,
        isLiked,
        replies: (message as any)._count?.replies || 0,
        shares: 0,
        isShared: false,
        replyToId: message.replyToId || undefined,
        replyToAuthor: message.replyToAuthor || undefined
      }
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

