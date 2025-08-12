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
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: userId } = await params

    // Récupérer l'utilisateur par ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            messages: true
          }
        },
        followers: { 
          select: { 
            followerId: true 
          } 
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier si l'utilisateur connecté suit cet utilisateur
    const currentUser = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    })
    
    const isFollowing = !!user.followers.find(f => f.followerId === currentUser?.id)

    // Transformer les données
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: `Membre depuis ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`,
      followers: user._count.followers,
      following: user._count.following,
      posts: user._count.messages,
      isFollowing
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
