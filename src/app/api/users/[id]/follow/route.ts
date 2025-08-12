import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!me) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    const { id: targetId } = await params
    if (me.id === targetId) return NextResponse.json({ error: 'Impossible de se suivre soi-même' }, { status: 400 })

    await prisma.userFollow.upsert({
      where: { followerId_followingId: { followerId: me.id, followingId: targetId } },
      update: {},
      create: { followerId: me.id, followingId: targetId }
    })

    const followers = await prisma.userFollow.count({ where: { followingId: targetId } })
    return NextResponse.json({ isFollowing: true, followers })
  } catch (e) {
    console.error('Erreur follow:', e)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!me) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    const { id: targetId } = await params

    await prisma.userFollow.delete({ where: { followerId_followingId: { followerId: me.id, followingId: targetId } } }).catch(() => {})
    const followers = await prisma.userFollow.count({ where: { followingId: targetId } })
    return NextResponse.json({ isFollowing: false, followers })
  } catch (e) {
    console.error('Erreur unfollow:', e)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}



