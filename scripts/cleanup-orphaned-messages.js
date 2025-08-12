const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupOrphanedMessages() {
  try {
    console.log('🧹 Nettoyage des messages orphelins...')
    
    // Récupérer tous les utilisateurs existants
    const users = await prisma.user.findMany({
      select: { id: true, name: true }
    })
    
    console.log(`👥 ${users.length} utilisateurs trouvés:`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.id})`)
    })
    
    // Récupérer tous les messages
    const messages = await prisma.message.findMany({
      select: { id: true, authorId: true, content: true }
    })
    
    console.log(`\n💬 ${messages.length} messages trouvés`)
    
    // Identifier les messages orphelins
    const validUserIds = users.map(u => u.id)
    const orphanedMessages = messages.filter(msg => !validUserIds.includes(msg.authorId))
    
    if (orphanedMessages.length > 0) {
      console.log(`\n🗑️ ${orphanedMessages.length} messages orphelins trouvés:`)
      orphanedMessages.forEach(msg => {
        console.log(`  - Message ${msg.id}: "${msg.content.substring(0, 50)}..." (auteur: ${msg.authorId})`)
      })
      
      // Supprimer les messages orphelins
      const deleteResult = await prisma.message.deleteMany({
        where: {
          authorId: {
            notIn: validUserIds
          }
        }
      })
      
      console.log(`\n✅ ${deleteResult.count} messages orphelins supprimés`)
    } else {
      console.log('\n✅ Aucun message orphelin trouvé')
    }
    
    // Vérifier les likes orphelins
    const orphanedLikes = await prisma.messageLike.findMany({
      where: {
        OR: [
          { userId: { notIn: validUserIds } },
          { messageId: { notIn: messages.map(m => m.id) } }
        ]
      }
    })
    
    if (orphanedLikes.length > 0) {
      console.log(`\n🗑️ ${orphanedLikes.length} likes orphelins trouvés`)
      
      const deleteLikesResult = await prisma.messageLike.deleteMany({
        where: {
          OR: [
            { userId: { notIn: validUserIds } },
            { messageId: { notIn: messages.map(m => m.id) } }
          ]
        }
      })
      
      console.log(`✅ ${deleteLikesResult.count} likes orphelins supprimés`)
    }
    
    console.log('\n🎉 Nettoyage terminé !')
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupOrphanedMessages()

