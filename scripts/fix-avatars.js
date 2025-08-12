const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Prénoms masculins français
const maleNames = [
  'Thomas', 'Lucas', 'Hugo', 'Jules', 'Louis', 'Arthur', 'Raphaël', 'Gabriel', 'Antoine', 'Paul',
  'Nathan', 'Adam', 'Théo', 'Ethan', 'Alexandre', 'Victor', 'Léo', 'Eliott', 'Maxime', 'Baptiste'
]

// Prénoms féminins français
const femaleNames = [
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

function getUniqueAvatar(gender, usedAvatars, indexRef) {
  const base = gender === 'male' ? 'men' : 'women'
  
  // Essayer randomuser.me avec index unique
  for (let i = 0; i < 100; i++) {
    const index = (indexRef.value + i) % 100
    const avatar = `https://randomuser.me/api/portraits/${base}/${index}.jpg`
    if (!usedAvatars.has(avatar)) {
      usedAvatars.add(avatar)
      indexRef.value = index + 1
      return avatar
    }
  }
  
  // Fallback avec pravatar
  const seed = Math.random().toString(36).substring(7)
  const pravatar = `https://i.pravatar.cc/150?u=${seed}`
  usedAvatars.add(pravatar)
  return pravatar
}

async function fixAvatars() {
  try {
    console.log('🔧 Correction forcée des avatars avec correspondance genre...')
    
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
    const usedAvatars = new Set()
    const maleIndex = { value: 0 }
    const femaleIndex = { value: 0 }
    
    let fixedCount = 0
    
    for (const user of users) {
      const firstName = user.name.split(' ')[0]
      const detectedGender = detectGender(firstName)
      
      // Vérifier si l'avatar actuel correspond au genre
      const currentAvatar = user.avatar || ''
      const isMaleAvatar = currentAvatar.includes('/men/') || currentAvatar.includes('male')
      const isFemaleAvatar = currentAvatar.includes('/women/') || currentAvatar.includes('female')
      
      let needsUpdate = false
      
      // Vérifier la correspondance genre
      if (detectedGender === 'male' && !isMaleAvatar) {
        needsUpdate = true
      } else if (detectedGender === 'female' && !isFemaleAvatar) {
        needsUpdate = true
      }
      
      // Vérifier les doublons
      if (usedAvatars.has(currentAvatar)) {
        needsUpdate = true
      }
      
      if (needsUpdate) {
        const newAvatar = getUniqueAvatar(
          detectedGender, 
          usedAvatars, 
          detectedGender === 'male' ? maleIndex : femaleIndex
        )
        
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: newAvatar }
        })
        
        console.log(`♻️ Avatar corrigé pour ${user.name} (${detectedGender === 'male' ? 'Homme' : 'Femme'})`)
        fixedCount++
      } else {
        usedAvatars.add(currentAvatar)
        console.log(`✅ ${user.name} - Avatar correct (${detectedGender === 'male' ? 'Homme' : 'Femme'})`)
      }
    }
    
    console.log(`\n✅ Correction terminée ! ${fixedCount} avatars corrigés.`)
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...')
    const finalUsers = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
    const finalAvatars = new Set()
    let duplicates = 0
    
    for (const user of finalUsers) {
      if (finalAvatars.has(user.avatar)) {
        duplicates++
        console.log(`⚠️ Doublon détecté: ${user.name} - ${user.avatar}`)
      } else {
        finalAvatars.add(user.avatar)
      }
    }
    
    if (duplicates === 0) {
      console.log('✅ Aucun doublon détecté !')
    } else {
      console.log(`⚠️ ${duplicates} doublons restants`)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAvatars()

