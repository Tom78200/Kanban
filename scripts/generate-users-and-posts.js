const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Photos de profil d'avatars génériques par genre
const maleAvatarUrls = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
]

const femaleAvatarUrls = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
]

// Noms par genre pour plus de réalisme
const maleFirstNames = [
  'Thomas', 'Lucas', 'Hugo', 'Jules', 'Louis', 'Arthur', 'Raphaël', 'Gabriel', 'Antoine', 'Paul',
  'Nathan', 'Adam', 'Théo', 'Ethan', 'Alexandre', 'Victor', 'Léo', 'Eliott', 'Maxime', 'Baptiste'
]

const femaleFirstNames = [
  'Emma', 'Léa', 'Alice', 'Chloé', 'Jade', 'Inès', 'Camille', 'Sarah', 'Clara', 'Zoé',
  'Eva', 'Lola', 'Mia', 'Nina', 'Louise', 'Agathe', 'Julia', 'Manon', 'Léna', 'Romane'
]

const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
  'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
  'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez'
]

// Messages générés
const messages = [
  "Salut tout le monde ! Comment ça va aujourd'hui ? 😊",
  "J'ai enfin terminé ce projet sur lequel je travaillais depuis des semaines ! 🎉",
  "Quelqu'un a des recommandations de livres à lire ? Je cherche quelque chose d'inspirant 📚",
  "Le weekend arrive enfin ! Des plans intéressants ? 🎯",
  "J'ai découvert une nouvelle série Netflix hier soir, vraiment addictive ! 📺",
  "Quel temps magnifique aujourd'hui ! Parfait pour une balade en ville ☀️",
  "Quelqu'un a des conseils pour améliorer sa productivité au travail ? 💼",
  "J'ai cuisiné un nouveau plat ce soir, c'était délicieux ! 👨‍🍳",
  "Quelqu'un a des suggestions de musiques pour se motiver ? 🎵",
  "J'ai commencé un nouveau hobby cette semaine, c'est passionnant ! 🎨",
  "Quelqu'un a des recommandations de films à voir ce weekend ? 🎬",
  "J'ai fait une randonnée ce matin, les paysages étaient magnifiques ! 🏔️",
  "Quelqu'un a des conseils pour bien organiser son temps ? ⏰",
  "J'ai lu un article très intéressant sur l'innovation technologique aujourd'hui 🤖",
  "Quelqu'un a des suggestions de restaurants sympas dans le coin ? 🍽️",
  "J'ai commencé un nouveau cours en ligne, c'est vraiment enrichissant ! 📖",
  "Quelqu'un a des conseils pour bien démarrer la journée ? 🌅",
  "J'ai découvert une nouvelle application géniale aujourd'hui ! 📱",
  "Quelqu'un a des recommandations de podcasts à écouter ? 🎧",
  "J'ai fait du sport ce matin, je me sens plein d'énergie ! 💪"
]

// Commentaires générés
const comments = [
  "Super ! 👍",
  "Très intéressant !",
  "Merci pour le partage !",
  "J'adore ! 😍",
  "Excellente idée !",
  "Ça donne envie d'essayer !",
  "Très bien expliqué !",
  "Je suis d'accord avec toi !",
  "C'est génial ! 🎉",
  "Merci pour les conseils !",
  "J'ai hâte d'essayer !",
  "Très inspirant ! ✨",
  "Excellente initiative !",
  "Ça a l'air passionnant !",
  "Merci pour la recommandation !",
  "Je vais tester ça !",
  "Très bien fait ! 👏",
  "C'est une excellente idée !",
  "J'adore cette approche !",
  "Merci pour l'inspiration !"
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomUserAvatar(isMale, used, fallbackIndexRef, seed) {
  const pool = isMale ? maleAvatarUrls : femaleAvatarUrls
  
  // try a unique from pool first
  for (const url of pool) {
    if (!used.has(url)) {
      used.add(url)
      return url
    }
  }
  
  // fallback to randomuser.me unique index per gender
  const base = isMale ? 'men' : 'women'
  const index = (fallbackIndexRef.value++) % 100
  const alt = `https://randomuser.me/api/portraits/${base}/${index}.jpg`
  if (!used.has(alt)) {
    used.add(alt)
    return alt
  }
  
  // ultimate fallback: pravatar with seed
  const pravatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`
  used.add(pravatar)
  return pravatar
}

async function generateUsersAndPosts() {
  try {
    console.log('🚀 Début de la génération des utilisateurs et posts...')

    // Générer 20 utilisateurs
    const users = []
    const usedAvatars = new Set()
    const maleFallback = { value: 0 }
    const femaleFallback = { value: 0 }

    for (let i = 0; i < 20; i++) {
      // Déterminer le genre (50/50)
      const isMale = Math.random() < 0.5
      
      const firstName = isMale ? getRandomElement(maleFirstNames) : getRandomElement(femaleFirstNames)
      const lastName = getRandomElement(lastNames)
      const name = `${firstName} ${lastName}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`
      
      // Assigner un avatar unique selon le genre
      const avatar = getRandomUserAvatar(
        isMale,
        usedAvatars,
        isMale ? maleFallback : femaleFallback,
        `${name}-${i}`
      )
      
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          avatar
        }
      })
      
      users.push(user)
      console.log(`👤 Utilisateur créé: ${name} (${email}) - ${isMale ? 'Homme' : 'Femme'} - avatar unique`)
    }

    console.log(`\n✅ ${users.length} utilisateurs créés avec succès !`)

    // Générer des messages pour chaque utilisateur
    const createdMessages = []
    for (const user of users) {
      const messageCount = Math.floor(Math.random() * 3) + 1 // 1-3 messages par utilisateur
      
      for (let i = 0; i < messageCount; i++) {
        const message = await prisma.message.create({
          data: {
            content: getRandomElement(messages),
            authorId: user.id,
            createdAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) // Dernière semaine
          }
        })
        
        createdMessages.push(message)
        console.log(`💬 Message créé par ${user.name}: "${message.content.substring(0, 50)}..."`)
      }
    }

    console.log(`\n✅ ${createdMessages.length} messages créés !`)

    // Générer des commentaires
    let commentCount = 0
    for (const message of createdMessages) {
      const commentCountForMessage = Math.floor(Math.random() * 4) + 1 // 1-4 commentaires par message
      
      for (let i = 0; i < commentCountForMessage; i++) {
        const randomUser = getRandomElement(users)
        const comment = await prisma.message.create({
          data: {
            content: getRandomElement(comments),
            authorId: randomUser.id,
            replyToId: message.id,
            replyToAuthor: message.author?.name || 'Utilisateur',
            createdAt: getRandomDate(new Date(message.createdAt), new Date())
          }
        })
        
        commentCount++
        console.log(`💭 Commentaire créé par ${randomUser.name} sur le message de ${message.author?.name || 'Utilisateur'}`)
      }
    }

    console.log(`\n✅ ${commentCount} commentaires créés !`)

    // Générer des likes
    let likeCount = 0
    for (const message of createdMessages) {
      const likeCountForMessage = Math.floor(Math.random() * 8) + 1 // 1-8 likes par message
      const usersToLike = getRandomElements(users, likeCountForMessage)
      
      for (const user of usersToLike) {
        if (user.id !== message.authorId) { // Ne pas liker ses propres messages
          await prisma.messageLike.create({
            data: {
              userId: user.id,
              messageId: message.id
            }
          })
          
          likeCount++
        }
      }
      
      // Mettre à jour le compteur de likes du message
      await prisma.message.update({
        where: { id: message.id },
        data: { likes: likeCountForMessage }
      })
      
      console.log(`❤️ ${likeCountForMessage} likes ajoutés au message de ${message.author?.name || 'Utilisateur'}`)
    }

    console.log(`\n✅ ${likeCount} likes créés !`)

    // Créer des suivis entre utilisateurs
    let followCount = 0
    for (const user of users) {
      const followCountForUser = Math.floor(Math.random() * 5) + 1 // 1-5 suivis par utilisateur
      const usersToFollow = getRandomElements(users.filter(u => u.id !== user.id), followCountForUser)
      
      for (const userToFollow of usersToFollow) {
        await prisma.userFollow.create({
          data: {
            followerId: user.id,
            followingId: userToFollow.id
          }
        })
        
        followCount++
      }
      
      console.log(`👥 ${user.name} suit ${followCountForUser} utilisateurs`)
    }

    console.log(`\n✅ ${followCount} relations de suivi créées !`)

    console.log('\n🎉 Génération terminée avec succès !')
    console.log('\n📊 Résumé :')
    console.log(`👥 Utilisateurs: ${users.length}`)
    console.log(`💬 Messages: ${createdMessages.length}`)
    console.log(`💭 Commentaires: ${commentCount}`)
    console.log(`❤️ Likes: ${likeCount}`)
    console.log(`👥 Suivis: ${followCount}`)

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
generateUsersAndPosts()
