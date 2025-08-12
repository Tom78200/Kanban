const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs...')
    
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    })
    
    console.log(`\n👥 ${users.length} utilisateurs trouvés:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`)
    })
    
    // Vérifier les messages
    const messages = await prisma.message.findMany({
      select: { id: true, authorId: true, content: true },
      take: 5
    })
    
    console.log(`\n💬 Exemples de messages (${messages.length} premiers):`)
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. Message ${msg.id}: "${msg.content.substring(0, 30)}..." - Auteur ID: ${msg.authorId}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()

