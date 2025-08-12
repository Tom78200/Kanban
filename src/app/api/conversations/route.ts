import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { name, memberIds } = await request.json()
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }
    const ids: string[] = Array.isArray(memberIds) ? memberIds.filter(Boolean) : []
    const uniqueIds = Array.from(new Set([me.id, ...ids]))

    // Validate users exist
    const users = await prisma.user.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } })
    const validIds = users.map(u => u.id)

    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({ data: { name: name.trim(), ownerId: me!.id } })
      await tx.teamMember.createMany({
        data: validIds.map(id => ({ teamId: team.id, userId: id, role: id === me!.id ? 'OWNER' : 'MEMBER' }))
      })
      const chat = await tx.teamChat.create({ data: { teamId: team.id, name: 'Général' } })
      return { teamId: team.id, chatId: chat.id }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('POST /conversations error', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Récupère tous les teams auxquels je participe, avec les chats et les membres (utilisateurs)
    const memberships = await prisma.teamMember.findMany({
      where: { userId: me.id },
      include: {
        team: {
          include: {
            chats: true,
            members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } }
          }
        }
      }
    })

    const chats = memberships.flatMap((m) =>
      m.team.chats.map((c) => ({
        id: c.id,
        name: m.team.name || c.name,
        members: m.team.members.map((mm) => ({
          id: mm.user.id,
          name: mm.user.name,
          email: mm.user.email,
          avatar: mm.user.avatar || undefined
        })),
        team: {
          id: m.team.id,
          ownerId: m.team.ownerId
        }
      }))
    )

    return NextResponse.json(chats)
  } catch (e) {
    console.error('GET /conversations error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


