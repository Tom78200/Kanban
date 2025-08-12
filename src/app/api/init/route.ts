import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Vérifier si la base de données est déjà initialisée
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({ 
        message: 'Base de données déjà initialisée',
        userCount 
      });
    }

    // Créer des utilisateurs de démonstration
    const users = [
      {
        email: 'admin@kanban.com',
        name: 'Admin Kanban',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'ADMIN' as const
      },
      {
        email: 'marie.dupont@example.com',
        name: 'Marie Dupont',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'pierre.martin@example.com',
        name: 'Pierre Martin',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'sophie.bernard@example.com',
        name: 'Sophie Bernard',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'thomas.leroy@example.com',
        name: 'Thomas Leroy',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      }
    ];

    // Insérer les utilisateurs
    const createdUsers = await Promise.all(
      users.map(user => 
        prisma.user.create({
          data: user
        })
      )
    );

    // Créer des projets de démonstration
    const projects = [
      {
        name: 'Site E-commerce',
        description: 'Développement d\'un site de vente en ligne moderne',
        ownerId: createdUsers[1].id
      },
      {
        name: 'Application Mobile',
        description: 'Création d\'une app mobile pour la gestion des tâches',
        ownerId: createdUsers[2].id
      },
      {
        name: 'Dashboard Analytics',
        description: 'Interface d\'analyse des données utilisateurs',
        ownerId: createdUsers[3].id
      }
    ];

    const createdProjects = await Promise.all(
      projects.map(project => 
        prisma.project.create({
          data: project
        })
      )
    );

    // Créer des tâches de démonstration
    const tasks = [
      {
        title: 'Design de la page d\'accueil',
        description: 'Créer le design responsive de la page principale',
        status: 'todo' as const,
        priority: 'high' as const,
        projectId: createdProjects[0].id,
        creatorId: createdUsers[1].id,
        createdById: createdUsers[1].id,
        assigneeId: createdUsers[2].id
      },
      {
        title: 'Intégration API de paiement',
        description: 'Implémenter Stripe pour les transactions',
        status: 'doing' as const,
        priority: 'high' as const,
        projectId: createdProjects[0].id,
        creatorId: createdUsers[1].id,
        createdById: createdUsers[1].id,
        assigneeId: createdUsers[3].id
      },
      {
        title: 'Tests unitaires',
        description: 'Écrire les tests pour les composants React',
        status: 'done' as const,
        priority: 'medium' as const,
        projectId: createdProjects[0].id,
        creatorId: createdUsers[1].id,
        createdById: createdUsers[1].id,
        assigneeId: createdUsers[4].id
      }
    ];

    await Promise.all(
      tasks.map(task => 
        prisma.task.create({
          data: task
        })
      )
    );

    // Créer des équipes de démonstration
    const teams = [
      {
        name: 'Équipe Développement',
        ownerId: createdUsers[1].id
      },
      {
        name: 'Équipe Design',
        ownerId: createdUsers[2].id
      }
    ];

    const createdTeams = await Promise.all(
      teams.map(team => 
        prisma.team.create({
          data: team
        })
      )
    );

    // Ajouter des membres aux équipes
    await Promise.all([
      prisma.teamMember.create({
        data: {
          userId: createdUsers[2].id,
          teamId: createdTeams[0].id
        }
      }),
      prisma.teamMember.create({
        data: {
          userId: createdUsers[3].id,
          teamId: createdTeams[0].id
        }
      }),
      prisma.teamMember.create({
        data: {
          userId: createdUsers[4].id,
          teamId: createdTeams[1].id
        }
      })
    ]);

    // Créer des chats d'équipe
    const chats = [
      {
        name: 'Général',
        teamId: createdTeams[0].id
      },
      {
        name: 'Général',
        teamId: createdTeams[1].id
      }
    ];

    const createdChats = await Promise.all(
      chats.map(chat => 
        prisma.teamChat.create({
          data: chat
        })
      )
    );

    // Créer des messages de démonstration
    const messages = [
      {
        content: 'Bonjour équipe ! Bienvenue sur le projet !',
        authorId: createdUsers[1].id,
        chatId: createdChats[0].id
      },
      {
        content: 'Salut ! Ravi de faire partie de l\'équipe !',
        authorId: createdUsers[2].id,
        chatId: createdChats[0].id
      },
      {
        content: 'On commence quand le développement ?',
        authorId: createdUsers[3].id,
        chatId: createdChats[0].id
      }
    ];

    await Promise.all(
      messages.map(message => 
        prisma.teamMessage.create({
          data: message
        })
      )
    );

    return NextResponse.json({ 
      message: 'Base de données initialisée avec succès',
      usersCreated: createdUsers.length,
      projectsCreated: createdProjects.length,
      teamsCreated: createdTeams.length
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation de la base de données' },
      { status: 500 }
    );
  }
}

