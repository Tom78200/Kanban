const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('🧹 Début du nettoyage de la base de données...')
    
    // Supprimer toutes les données dans l'ordre correct pour éviter les erreurs de contrainte
    
    // 1. Notifications
    const deletedNotifications = await prisma.notification.deleteMany({})
    console.log(`🗑️ ${deletedNotifications.count} notifications supprimées`)
    
    // 2. Likes de messages
    const deletedMessageLikes = await prisma.messageLike.deleteMany({})
    console.log(`🗑️ ${deletedMessageLikes.count} likes de messages supprimés`)
    
    // 3. Images de messages
    const deletedMessageImages = await prisma.messageImage.deleteMany({})
    console.log(`🗑️ ${deletedMessageImages.count} images de messages supprimées`)
    
    // 4. Messages (et leurs réponses)
    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`🗑️ ${deletedMessages.count} messages supprimés`)
    
    // 5. Commentaires
    const deletedComments = await prisma.comment.deleteMany({})
    console.log(`🗑️ ${deletedComments.count} commentaires supprimés`)
    
    // 6. Activités
    const deletedActivities = await prisma.activity.deleteMany({})
    console.log(`🗑️ ${deletedActivities.count} activités supprimées`)
    
    // 7. Tâches
    const deletedTasks = await prisma.task.deleteMany({})
    console.log(`🗑️ ${deletedTasks.count} tâches supprimées`)
    
    // 8. Projets
    const deletedProjects = await prisma.project.deleteMany({})
    console.log(`🗑️ ${deletedProjects.count} projets supprimés`)
    
    // 9. Membres d'équipe
    const deletedTeamMembers = await prisma.teamMember.deleteMany({})
    console.log(`🗑️ ${deletedTeamMembers.count} membres d'équipe supprimés`)
    
    // 10. Messages d'équipe
    const deletedTeamMessages = await prisma.teamMessage.deleteMany({})
    console.log(`🗑️ ${deletedTeamMessages.count} messages d'équipe supprimés`)
    
    // 11. Chats d'équipe
    const deletedTeamChats = await prisma.teamChat.deleteMany({})
    console.log(`🗑️ ${deletedTeamChats.count} chats d'équipe supprimés`)
    
    // 12. Équipes
    const deletedTeams = await prisma.team.deleteMany({})
    console.log(`🗑️ ${deletedTeams.count} équipes supprimées`)
    
    // 13. Suivis d'utilisateurs
    const deletedUserFollows = await prisma.userFollow.deleteMany({})
    console.log(`🗑️ ${deletedUserFollows.count} suivis d'utilisateurs supprimés`)
    
    // 14. Sessions
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`🗑️ ${deletedSessions.count} sessions supprimées`)
    
    // 15. Comptes OAuth
    const deletedAccounts = await prisma.account.deleteMany({})
    console.log(`🗑️ ${deletedAccounts.count} comptes OAuth supprimés`)
    
    // 16. Tous les utilisateurs
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`🗑️ ${deletedUsers.count} utilisateurs supprimés`)
    
    console.log('✅ Base de données entièrement nettoyée !')
    console.log('\n📊 Résumé des suppressions :')
    console.log(`👥 Utilisateurs: ${deletedUsers.count}`)
    console.log(`💬 Messages: ${deletedMessages.count}`)
    console.log(`📁 Projets: ${deletedProjects.count}`)
    console.log(`✅ Tâches: ${deletedTasks.count}`)
    console.log(`👥 Équipes: ${deletedTeams.count}`)
    console.log(`🔔 Notifications: ${deletedNotifications.count}`)
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la base de données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
clearDatabase()

