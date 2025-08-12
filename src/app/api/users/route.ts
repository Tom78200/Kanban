import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''

    // Récupérer tous les utilisateurs sauf l'utilisateur connecté
    const users = await prisma.user.findMany({
      where: {
        email: { not: session.user.email },
        ...(q ? { OR: [
          { name: { contains: q } },
          { email: { contains: q } }
        ] } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            followers: true
          }
        },
        followers: { select: { followerId: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformer les données pour correspondre au format attendu
    const current = await prisma.user.findUnique({ where: { email: session.user.email } })
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: `Membre depuis ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`,
      followers: user._count.followers,
      isFollowing: !!user.followers.find(f => f.followerId === current?.id)
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

