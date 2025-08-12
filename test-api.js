const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPI() {
  try {
    console.log('🔍 Test de l\'API des utilisateurs...')
    
    // Simuler une requête à l'API
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            followers: true
          }
        },
        followers: { select: { followerId: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n👥 ${users.length} utilisateurs trouvés:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ID: ${user.id} - Email: ${user.email}`)
    })

    // Tester un utilisateur spécifique
    if (users.length > 0) {
      const testUser = users[0]
      console.log(`\n🧪 Test avec l'utilisateur: ${testUser.name} (${testUser.id})`)
      
      // Simuler l'API de profil
      const profileUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              following: true,
              messages: true
            }
          },
          followers: { 
            select: { 
              followerId: true 
            } 
          }
        }
      })

      if (profileUser) {
        console.log(`✅ Profil trouvé: ${profileUser.name}`)
        console.log(`   - Followers: ${profileUser._count.followers}`)
        console.log(`   - Following: ${profileUser._count.following}`)
        console.log(`   - Messages: ${profileUser._count.messages}`)
      } else {
        console.log(`❌ Profil non trouvé pour l'ID: ${testUser.id}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()

