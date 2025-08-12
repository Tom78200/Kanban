# TaskMaster Pro - Professional Task Management Application

Une application de gestion de tâches professionnelle inspirée de Trello, construite avec Next.js 14, Prisma, et NextAuth.js.

## 🚀 Fonctionnalités

### ✅ Authentification & Sécurité
- **Inscription/Connexion** avec email et mot de passe
- **Connexion Google OAuth** intégrée
- **Hachage sécurisé** des mots de passe avec bcrypt
- **Sessions JWT** avec NextAuth.js
- **Protection des routes** avec middleware
- **Déconnexion** sécurisée

### 📊 Gestion des Tâches
- **Kanban Board** avec colonnes To Do, In Progress, Done
- **Drag & Drop** pour déplacer les tâches
- **Vue Liste** avec filtres et tri
- **Vue Calendrier** avec dates d'échéance
- **Création/Modification/Suppression** de tâches
- **Assignation** de tâches aux utilisateurs

### 📅 Calendrier Avancé
- **Affichage des tâches** par date
- **Indicateurs visuels** pour les types de tâches
- **Sélection de dates** avec détails
- **Statistiques** par jour
- **Navigation** entre les mois

### 🔔 Système de Notifications
- **Notifications en temps réel** pour les nouvelles tâches
- **Indicateurs visuels** pour les notifications non lues
- **Historique** des activités
- **Filtres** par type de notification

### 🎨 Interface Utilisateur
- **Design moderne** et responsive
- **Thème professionnel** noir et blanc avec accents colorés
- **Animations fluides** et transitions
- **Interface intuitive** inspirée de Trello

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: CSS-in-JS (inline styles)
- **Base de données**: SQLite avec Prisma ORM
- **Authentification**: NextAuth.js
- **Hachage**: bcryptjs
- **Déploiement**: Prêt pour Vercel/Netlify

## 📦 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd kanban-app
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Créer un fichier `.env.local` à la racine du projet :
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth (optionnel mais recommandé)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"
```

#### Configuration Google OAuth (Optionnel)
Pour activer la connexion avec Google :

1. **Créer un projet Google Cloud Console** :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet ou sélectionnez un existant

2. **Activer l'API Google+** :
   - Dans le menu, allez à "APIs & Services" > "Library"
   - Recherchez "Google+ API" et activez-la

3. **Créer des identifiants OAuth** :
   - Allez à "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
   - Sélectionnez "Web application"
   - Ajoutez les URIs de redirection autorisés :
     - `http://localhost:3000/api/auth/callback/google` (développement)
     - `https://your-domain.com/api/auth/callback/google` (production)

4. **Copier les identifiants** :
   - Copiez le Client ID et Client Secret
   - Ajoutez-les dans votre fichier `.env.local`

### 4. Configuration de la base de données
```bash
# Pousser le schéma vers la base de données
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### 5. Lancer l'application
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🗄️ Structure de la Base de Données

### Modèles Principaux
- **User**: Utilisateurs avec rôles et profils
- **Project**: Projets avec propriétaires et membres
- **Task**: Tâches avec assignation et dates d'échéance
- **Comment**: Commentaires sur les tâches
- **Activity**: Historique des activités
- **Attachment**: Pièces jointes

### Relations
- Un utilisateur peut créer plusieurs projets
- Un projet peut avoir plusieurs membres
- Une tâche appartient à un projet et peut être assignée à un utilisateur
- Les commentaires sont liés aux tâches et utilisateurs
- Les activités tracent toutes les actions importantes

## 🔧 Configuration Avancée

### Variables d'Environnement
```env
# Production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
DATABASE_URL="your-production-database-url"

# Développement
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
DATABASE_URL="file:./dev.db"
```

### Base de Données de Production
Pour la production, remplacez SQLite par PostgreSQL ou MySQL :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskmaster"
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Netlify
1. Connectez votre repository
2. Configurez les variables d'environnement
3. Déployez avec `npm run build`

## 📱 Fonctionnalités Mobile

- **Responsive design** pour tous les écrans
- **Touch-friendly** interface
- **PWA ready** pour installation mobile

## 🔒 Sécurité

- **Hachage des mots de passe** avec bcrypt
- **Protection CSRF** avec NextAuth
- **Validation des données** côté serveur
- **Middleware d'authentification** pour les routes protégées

## 🎯 Roadmap

### Prochaines Fonctionnalités
- [ ] **Gestion des projets** avec équipes
- [ ] **Templates de tâches** réutilisables
- [ ] **Intégrations** (Slack, GitHub, etc.)
- [ ] **Rapports et analytics** avancés
- [ ] **Notifications push** en temps réel
- [ ] **API REST** complète
- [ ] **Mode sombre** / thèmes personnalisables

### Améliorations Techniques
- [ ] **Tests unitaires** et d'intégration
- [ ] **Optimisation des performances**
- [ ] **Cache Redis** pour les sessions
- [ ] **Monitoring** et logging avancé

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**TaskMaster Pro** - Gestion de tâches professionnelle pour équipes modernes 🚀
