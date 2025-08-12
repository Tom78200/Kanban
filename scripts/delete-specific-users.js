const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteSpecificUsers() {
  try {
    console.log('🗑️ Suppression des utilisateurs spécifiés...')
    
    const usersToDelete = [
      'Louise Simon',
      'Léna Martin', 
      'Clara Petit',
      'Jules Bonnet',
      'Léa Mercier',
      'Mia Lefèvre'
    ]
    
    for (const userName of usersToDelete) {
      const user = await prisma.user.findFirst({
        where: { name: userName }
      })
      
      if (user) {
        // Supprimer les likes de l'utilisateur
        await prisma.messageLike.deleteMany({
          where: { userId: user.id }
        })
        
        // Supprimer les messages de l'utilisateur
        await prisma.message.deleteMany({
          where: { authorId: user.id }
        })
        
        // Supprimer les relations de suivi
        await prisma.userFollow.deleteMany({
          where: {
            OR: [
              { followerId: user.id },
              { followingId: user.id }
            ]
          }
        })
        
        // Supprimer l'utilisateur
        await prisma.user.delete({
          where: { id: user.id }
        })
        
        console.log(`✅ ${userName} supprimé`)
      } else {
        console.log(`❌ ${userName} non trouvé`)
      }
    }
    
    console.log('✅ Suppression terminée !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteSpecificUsers()
