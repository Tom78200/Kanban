import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateAdminPassword } from '@/lib/admin-config'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est connecté
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé - Connexion requise' }, { status: 401 })
    }

    // Vérifier le mot de passe admin dans les headers
    const adminPassword = request.headers.get('x-admin-password')
    
    if (!adminPassword || !validateAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Mot de passe administrateur incorrect' }, { status: 403 })
    }

    // Vérifier que l'utilisateur existe
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Supprimer toutes les données dans l'ordre correct pour éviter les erreurs de contrainte
    console.log('🧹 Début du nettoyage de la base de données...')

    // 1. Supprimer les notifications
    const deletedNotifications = await prisma.notification.deleteMany({})
    console.log(`🗑️ ${deletedNotifications.count} notifications supprimées`)

    // 2. Supprimer les likes de messages
    const deletedMessageLikes = await prisma.messageLike.deleteMany({})
    console.log(`🗑️ ${deletedMessageLikes.count} likes de messages supprimés`)

    // 3. Supprimer les images de messages
    const deletedMessageImages = await prisma.messageImage.deleteMany({})
    console.log(`🗑️ ${deletedMessageImages.count} images de messages supprimées`)

    // 4. Supprimer les messages (et leurs réponses)
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`🗑️ ${deletedMessages.count} messages supprimés`)

    // 5. Supprimer les commentaires
    const deletedComments = await prisma.comment.deleteMany({})
    console.log(`🗑️ ${deletedComments.count} commentaires supprimés`)

    // 6. Supprimer les activités
    const deletedActivities = await prisma.activity.deleteMany({})
    console.log(`🗑️ ${deletedActivities.count} activités supprimées`)

    // 7. Supprimer les tâches
    const deletedTasks = await prisma.task.deleteMany({})
    console.log(`🗑️ ${deletedTasks.count} tâches supprimées`)

    // 8. Supprimer les projets
    const deletedProjects = await prisma.project.deleteMany({})
    console.log(`🗑️ ${deletedProjects.count} projets supprimés`)

    // 9. Supprimer les membres d'équipe
    const deletedTeamMembers = await prisma.teamMember.deleteMany({})
    console.log(`🗑️ ${deletedTeamMembers.count} membres d'équipe supprimés`)

    // 10. Supprimer les messages d'équipe
    const deletedTeamMessages = await prisma.teamMessage.deleteMany({})
    console.log(`🗑️ ${deletedTeamMessages.count} messages d'équipe supprimés`)

    // 11. Supprimer les chats d'équipe
    const deletedTeamChats = await prisma.teamChat.deleteMany({})
    console.log(`🗑️ ${deletedTeamChats.count} chats d'équipe supprimés`)

    // 12. Supprimer les équipes
    const deletedTeams = await prisma.team.deleteMany({})
    console.log(`🗑️ ${deletedTeams.count} équipes supprimées`)

    // 13. Supprimer les suivis d'utilisateurs
    const deletedUserFollows = await prisma.userFollow.deleteMany({})
    console.log(`🗑️ ${deletedUserFollows.count} suivis d'utilisateurs supprimés`)

    // 14. Supprimer les sessions
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`🗑️ ${deletedSessions.count} sessions supprimées`)

    // 15. Supprimer les comptes OAuth
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`🗑️ ${deletedAccounts.count} comptes OAuth supprimés`)

    // 16. Supprimer tous les utilisateurs
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`🗑️ ${deletedUsers.count} utilisateurs supprimés`)

    console.log('✅ Base de données entièrement nettoyée !')

    return NextResponse.json({
      success: true,
      message: 'Base de données entièrement nettoyée',
      deleted: {
        users: deletedUsers.count,
        messages: deletedMessages.count,
        projects: deletedProjects.count,
        tasks: deletedTasks.count,
        teams: deletedTeams.count,
        notifications: deletedNotifications.count
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors du nettoyage de la base de données',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
