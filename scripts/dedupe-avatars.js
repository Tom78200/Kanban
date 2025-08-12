const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Prénoms masculins français
const maleNames = [
  'Thomas', 'Lucas', 'Hugo', 'Jules', 'Louis', 'Arthur', 'Raphaël', 'Gabriel', 'Antoine', 'Paul',
  'Nathan', 'Adam', 'Théo', 'Ethan', 'Alexandre', 'Victor', 'Léo', 'Eliott', 'Maxime', 'Baptiste',
  'Lucas', 'Hugo', 'Jules', 'Louis', 'Arthur', 'Raphaël', 'Gabriel', 'Antoine', 'Paul',
  'Nathan', 'Adam', 'Théo', 'Ethan', 'Alexandre', 'Victor', 'Léo', 'Eliott', 'Maxime', 'Baptiste'
]

// Prénoms féminins français
const femaleNames = [
  'Emma', 'Léa', 'Alice', 'Chloé', 'Jade', 'Inès', 'Camille', 'Sarah', 'Clara', 'Zoé',
  'Eva', 'Lola', 'Mia', 'Nina', 'Louise', 'Agathe', 'Julia', 'Manon', 'Léna', 'Romane',
  'Emma', 'Léa', 'Alice', 'Chloé', 'Jade', 'Inès', 'Camille', 'Sarah', 'Clara', 'Zoé',
  'Eva', 'Lola', 'Mia', 'Nina', 'Louise', 'Agathe', 'Julia', 'Manon', 'Léna', 'Romane'
]

function detectGender(firstName) {
  const normalizedName = firstName.toLowerCase()
  if (maleNames.map(n => n.toLowerCase()).includes(normalizedName)) {
    return 'male'
  }
  if (femaleNames.map(n => n.toLowerCase()).includes(normalizedName)) {
    return 'female'
  }
  // Fallback basé sur des patterns courants
  if (normalizedName.endsWith('e') && !normalizedName.endsWith('le') && !normalizedName.endsWith('me')) {
    return 'female'
  }
  return 'male' // par défaut
}

function uniqueFromSets(used, indexRef, gender, seed) {
  const base = gender === 'male' ? 'men' : 'women'
  const index = (indexRef.value++) % 100
  const alt = `https://randomuser.me/api/portraits/${base}/${index}.jpg`
  if (!used.has(alt)) {
    used.add(alt)
    return alt
  }
  const pravatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`
  used.add(pravatar)
  return pravatar
}

async function dedupe() {
  try {
    console.log('🔁 Déduplication des avatars avec correspondance genre...')
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
    const used = new Set()
    const men = { value: 0 }
    const women = { value: 0 }

    for (const [idx, user] of users.entries()) {
      if (!user.avatar) continue
      
      // Extraire le prénom
      const firstName = user.name.split(' ')[0]
      const detectedGender = detectGender(firstName)
      
      const lower = user.avatar.toLowerCase()
      if (!used.has(lower)) {
        used.add(lower)
        continue
      }
      
      // doublon -> réassigner un avatar unique selon le genre détecté
      const newAvatar = uniqueFromSets(
        used, 
        detectedGender === 'male' ? men : women, 
        detectedGender, 
        `${user.name}-${user.id}`
      )
      
      await prisma.user.update({ 
        where: { id: user.id }, 
        data: { avatar: newAvatar } 
      })
      
      console.log(`♻️ Avatar réassigné pour ${user.name} (${detectedGender === 'male' ? 'Homme' : 'Femme'})`)
    }

    console.log('✅ Déduplication terminée avec correspondance genre')
  } catch (e) {
    console.error('❌ Erreur déduplication:', e)
  } finally {
    await prisma.$disconnect()
  }
}

dedupe()
