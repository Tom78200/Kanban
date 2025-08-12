import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les équipes dont l'utilisateur est membre
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        chats: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1,
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Formater les conversations
    const conversations = teams.map(team => ({
      id: team.id,
      name: team.name,
      owner: team.owner,
      members: team.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        avatar: member.user.avatar
      })),
      chats: team.chats.map(chat => ({
        id: chat.id,
        name: chat.name,
        lastMessage: chat.messages[0] || null
      }))
    }));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, memberEmails } = await request.json();

    if (!name || !memberEmails || !Array.isArray(memberEmails)) {
      return NextResponse.json(
        { error: 'Nom et membres requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        name,
        ownerId: user.id,
        members: {
          create: [
            { userId: user.id }, // Créateur de l'équipe
            ...memberEmails.map((email: string) => ({
              userId: email // On va d'abord créer l'équipe, puis ajouter les membres
            }))
          ]
        },
        chats: {
          create: {
            name: 'Général'
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    );
  }
}


