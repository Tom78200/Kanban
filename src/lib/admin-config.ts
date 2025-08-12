// Configuration d'administration
// En production, utiliser des variables d'environnement

export const ADMIN_CONFIG = {
  // Mot de passe administrateur
  // ⚠️ IMPORTANT: Changer ce mot de passe en production !
  PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  
  // Nombre maximum de tentatives de connexion
  MAX_LOGIN_ATTEMPTS: 3,
  
  // Durée de session admin (en minutes)
  SESSION_DURATION: 30,
  
  // Fonctions autorisées
  ALLOWED_FUNCTIONS: {
    CLEAR_DATABASE: true,
    MANAGE_USERS: true,
    VIEW_STATISTICS: true,
    MANAGE_PROJECTS: true
  }
}

// Fonction pour valider le mot de passe admin
export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_CONFIG.PASSWORD
}

// Fonction pour vérifier les permissions
export function hasPermission(functionName: keyof typeof ADMIN_CONFIG.ALLOWED_FUNCTIONS): boolean {
  return ADMIN_CONFIG.ALLOWED_FUNCTIONS[functionName] || false
}

