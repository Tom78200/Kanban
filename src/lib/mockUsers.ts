export interface MockUser {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  followers: number
  following: number
  posts: number
  isFollowing: boolean
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Raphael Randek',
    email: 'raphael@example.com',
    avatar: undefined,
    bio: 'Développeur passionné par les nouvelles technologies et la productivité. J\'aime créer des applications qui simplifient la vie quotidienne.',
    followers: 1247,
    following: 892,
    posts: 156,
    isFollowing: false
  },
  {
    id: '2',
    name: 'Marie Dubois',
    email: 'marie@example.com',
    avatar: undefined,
    bio: 'Designer UX/UI passionnée par l\'expérience utilisateur et les interfaces intuitives.',
    followers: 342,
    following: 156,
    posts: 89,
    isFollowing: false
  },
  {
    id: '3',
    name: 'Thomas Martin',
    email: 'thomas@example.com',
    avatar: undefined,
    bio: 'Développeur Full-Stack spécialisé en React et Node.js. Amateur de café et de code propre.',
    followers: 567,
    following: 234,
    posts: 203,
    isFollowing: false
  },
  {
    id: '4',
    name: 'Sophie Bernard',
    email: 'sophie@example.com',
    avatar: undefined,
    bio: 'Product Manager avec 5 ans d\'expérience. J\'aime transformer les idées en produits qui changent la vie.',
    followers: 891,
    following: 445,
    posts: 67,
    isFollowing: false
  },
  {
    id: '5',
    name: 'Alexandre Moreau',
    email: 'alex@example.com',
    avatar: undefined,
    bio: 'DevOps Engineer. Automatisation, CI/CD et infrastructure cloud. 🚀',
    followers: 234,
    following: 123,
    posts: 45,
    isFollowing: false
  },
  {
    id: '6',
    name: 'Emma Rousseau',
    email: 'emma@example.com',
    avatar: undefined,
    bio: 'Data Scientist passionnée par le machine learning et l\'analyse de données.',
    followers: 678,
    following: 289,
    posts: 134,
    isFollowing: false
  },
  {
    id: '7',
    name: 'Lucas Petit',
    email: 'lucas@example.com',
    avatar: undefined,
    bio: 'Mobile Developer iOS/Android. Créateur d\'apps qui facilitent le quotidien.',
    followers: 445,
    following: 167,
    posts: 78,
    isFollowing: false
  },
  {
    id: '8',
    name: 'Camille Leroy',
    email: 'camille@example.com',
    avatar: undefined,
    bio: 'UX Researcher. J\'étudie les comportements utilisateurs pour créer des expériences optimales.',
    followers: 289,
    following: 134,
    posts: 56,
    isFollowing: false
  },
  {
    id: '9',
    name: 'Nicolas Durand',
    email: 'nico@example.com',
    avatar: undefined,
    bio: 'Backend Developer Python/Django. Performance et scalabilité sont mes priorités.',
    followers: 567,
    following: 234,
    posts: 123,
    isFollowing: false
  },
  {
    id: '10',
    name: 'Julie Simon',
    email: 'julie@example.com',
    avatar: undefined,
    bio: 'Frontend Developer Vue.js/React. J\'aime créer des interfaces élégantes et performantes.',
    followers: 345,
    following: 178,
    posts: 92,
    isFollowing: false
  },
  {
    id: '11',
    name: 'Pierre Lefevre',
    email: 'pierre@example.com',
    avatar: undefined,
    bio: 'Tech Lead avec 8 ans d\'expérience. J\'accompagne les équipes vers l\'excellence technique.',
    followers: 1234,
    following: 567,
    posts: 234,
    isFollowing: false
  },
  {
    id: '12',
    name: 'Sarah Mercier',
    email: 'sarah@example.com',
    avatar: undefined,
    bio: 'QA Engineer. La qualité du code est aussi importante que sa fonctionnalité.',
    followers: 234,
    following: 89,
    posts: 34,
    isFollowing: false
  },
  {
    id: '13',
    name: 'Antoine Girard',
    email: 'antoine@example.com',
    avatar: undefined,
    bio: 'Blockchain Developer. Passionné par la décentralisation et les smart contracts.',
    followers: 789,
    following: 345,
    posts: 156,
    isFollowing: false
  },
  {
    id: '14',
    name: 'Clara Fontaine',
    email: 'clara@example.com',
    avatar: undefined,
    bio: 'AI/ML Engineer. Je développe des solutions d\'intelligence artificielle innovantes.',
    followers: 567,
    following: 234,
    posts: 89,
    isFollowing: false
  },
  {
    id: '15',
    name: 'Maxime Roux',
    email: 'maxime@example.com',
    avatar: undefined,
    bio: 'Security Engineer. La cybersécurité n\'est pas une option, c\'est une nécessité.',
    followers: 456,
    following: 123,
    posts: 67,
    isFollowing: false
  },
  {
    id: '16',
    name: 'Léa Bonnet',
    email: 'lea@example.com',
    avatar: undefined,
    bio: 'Content Strategist. Je raconte des histoires qui connectent les marques aux utilisateurs.',
    followers: 345,
    following: 167,
    posts: 78,
    isFollowing: false
  },
  {
    id: '17',
    name: 'Hugo Laurent',
    email: 'hugo@example.com',
    avatar: undefined,
    bio: 'Game Developer Unity/Unreal. Créer des mondes virtuels est ma passion.',
    followers: 678,
    following: 234,
    posts: 145,
    isFollowing: false
  },
  {
    id: '18',
    name: 'Inès Moreau',
    email: 'ines@example.com',
    avatar: undefined,
    bio: 'Digital Marketing Specialist. Data-driven et créative dans mes approches.',
    followers: 456,
    following: 189,
    posts: 67,
    isFollowing: false
  },
  {
    id: '19',
    name: 'Romain Dubois',
    email: 'romain@example.com',
    avatar: undefined,
    bio: 'Cloud Architect AWS/Azure. J\'optimise les infrastructures pour la performance.',
    followers: 567,
    following: 234,
    posts: 89,
    isFollowing: false
  },
  {
    id: '20',
    name: 'Zoé Martin',
    email: 'zoe@example.com',
    avatar: undefined,
    bio: 'Accessibility Specialist. L\'inclusion numérique est au cœur de mon travail.',
    followers: 234,
    following: 89,
    posts: 45,
    isFollowing: false
  }
]

export const getMockUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(user => user.id === id)
}

export const getMockUserByName = (name: string): MockUser | undefined => {
  return mockUsers.find(user => user.name.toLowerCase().includes(name.toLowerCase()))
}

export const getRandomMockUsers = (count: number): MockUser[] => {
  const shuffled = [...mockUsers].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}


