import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    // Vérifier que l'utilisateur est membre de l'équipe
    const team = await prisma.team.findFirst({
      where: {
        id: id,
        members: {
          some: {
            user: {
              email: session.user.email
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les messages du chat
    const messages = await prisma.teamMessage.findMany({
      where: {
        chatId: id
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
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenu du message requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de l'équipe
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true
      }
    });

    if (!teamMember) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Créer le message
    const message = await prisma.teamMessage.create({
      data: {
        content,
        authorId: teamMember.user.id,
        chatId: id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'ID du message requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de l'équipe
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        user: {
          email: session.user.email
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Supprimer le message
    await prisma.teamMessage.delete({
      where: {
        id: messageId
      }
    });

    return NextResponse.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}



