# 🔐 Sécurité de l'Application

## Vue d'ensemble

Cette application web dispose d'un système de sécurité multi-niveaux pour protéger les données et les fonctions sensibles.

## 🛡️ Niveaux de Sécurité

### 1. Authentification Utilisateur
- **NextAuth.js** pour l'authentification sécurisée
- Sessions sécurisées avec cookies cryptés
- Protection des routes privées

### 2. Authentification Administrateur
- **Mot de passe admin** requis pour les fonctions sensibles
- **Double authentification** : utilisateur connecté + mot de passe admin
- **Headers sécurisés** pour la transmission du mot de passe

### 3. Protection des API
- Vérification des sessions sur toutes les routes sensibles
- Validation des permissions avant exécution
- Gestion des erreurs sécurisée

## 🔑 Configuration Admin

### Mot de passe par défaut
```
admin123
```

### ⚠️ IMPORTANT - Sécurité en Production

**AVANT** de déployer en production :

1. **Changer le mot de passe admin** :
   ```bash
   # Dans .env.local
   ADMIN_PASSWORD=votre_mot_de_passe_sécurisé
   ```

2. **Utiliser un mot de passe fort** :
   - Minimum 12 caractères
   - Mélange de majuscules, minuscules, chiffres et symboles
   - Exemple : `K9#mP2$vL8@nQ4!`

3. **Variables d'environnement** :
   ```env
   ADMIN_PASSWORD=votre_mot_de_passe_sécurisé
   NEXTAUTH_SECRET=votre_secret_nextauth
   NEXTAUTH_URL=https://votre-domaine.com
   ```

## 🚪 Accès Admin

### URL d'accès
- **Dashboard Admin** : `/admin`
- **Nettoyage Base de Données** : `/admin/clear-db`

### Procédure d'accès
1. Se connecter avec un compte utilisateur
2. Aller sur `/admin`
3. Entrer le mot de passe administrateur
4. Accéder aux fonctions d'administration

## 🗑️ Fonctions Sensibles

### Nettoyage de la Base de Données
- **Action irréversible** - Supprime TOUTES les données
- **Double confirmation** requise
- **Logs détaillés** de toutes les suppressions
- **Redirection automatique** après nettoyage

### Sécurité des Données
- **Suppression en cascade** pour éviter les erreurs de contrainte
- **Ordre de suppression** optimisé
- **Vérification d'intégrité** après nettoyage

## 🔒 Bonnes Pratiques

### Pour les Développeurs
1. **Ne jamais commiter** le mot de passe admin en production
2. **Utiliser des variables d'environnement** pour tous les secrets
3. **Tester la sécurité** avant chaque déploiement
4. **Auditer régulièrement** les accès admin

### Pour les Administrateurs
1. **Changer le mot de passe** immédiatement après installation
2. **Utiliser un mot de passe unique** et fort
3. **Limiter l'accès** aux fonctions sensibles
4. **Surveiller les logs** d'administration

## 🚨 Alertes de Sécurité

### Signaux d'Alerte
- Tentatives de connexion admin échouées
- Accès aux fonctions sensibles
- Suppression de données en masse

### Actions Recommandées
1. **Vérifier les logs** d'accès
2. **Changer le mot de passe** si nécessaire
3. **Révoquer les sessions** suspectes
4. **Contacter l'équipe** de sécurité

## 📋 Checklist de Sécurité

### Installation
- [ ] Changer le mot de passe admin par défaut
- [ ] Configurer les variables d'environnement
- [ ] Tester l'authentification admin
- [ ] Vérifier les permissions des fichiers

### Maintenance
- [ ] Mettre à jour les dépendances régulièrement
- [ ] Auditer les accès admin
- [ ] Sauvegarder les données importantes
- [ ] Tester les fonctions de récupération

### Production
- [ ] Utiliser HTTPS
- [ ] Configurer un firewall
- [ ] Mettre en place la surveillance
- [ ] Documenter les procédures d'urgence

## 🆘 Support Sécurité

En cas de problème de sécurité :
1. **Ne pas paniquer**
2. **Documenter l'incident**
3. **Changer immédiatement** le mot de passe admin
4. **Contacter l'équipe** de développement
5. **Suivre les procédures** de récupération

---

**⚠️ RAPPEL IMPORTANT :** La sécurité est une responsabilité partagée. Chaque utilisateur doit contribuer à maintenir la sécurité de l'application.

