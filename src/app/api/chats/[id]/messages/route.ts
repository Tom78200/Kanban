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
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id: chatId } = await params
    const messages = await prisma.teamMessage.findMany({
      where: { chatId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(messages)
  } catch (e) {
    console.error('GET /chats/[id]/messages error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const { id: chatId } = await params
    const { content } = await request.json()
    if (!content || !content.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Check membership via chat.team
    const chat = await prisma.teamChat.findUnique({ where: { id: chatId }, include: { team: { include: { members: true } } } })
    if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    const isMember = chat.team.members.some(m => m.userId === me.id)
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const msg = await prisma.teamMessage.create({
      data: { chatId, authorId: me.id, content: content.trim() },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    })
    return NextResponse.json(msg, { status: 201 })
  } catch (e) {
    console.error('POST /chats/[id]/messages error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const me = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 })

    const msg = await prisma.teamMessage.findUnique({ where: { id: messageId } })
    if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    if (msg.authorId !== me.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.teamMessage.delete({ where: { id: messageId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}



