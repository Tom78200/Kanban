import { mockUsers, getMockUserById } from './mockUsers'

export interface Message {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  image?: string // URL ou base64 de l'image
  timestamp: Date
  likes: number
  isLiked: boolean
  replies: number
  shares: number
  isShared: boolean
  originalMessage?: Message // Pour les partages
  replyTo?: string // ID du message auquel on répond
  replyToAuthor?: string // Nom de l'auteur du message auquel on répond
}

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Salut tout le monde ! Comment ça va ? 🚀',
    authorId: '1',
    authorName: 'Raphael Randek',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 5,
    isLiked: false,
    replies: 3,
    shares: 2,
    isShared: false
  },
  {
    id: '2',
    content: 'Je travaille sur un nouveau projet Kanban, c\'est vraiment sympa ! 📊',
    authorId: '1',
    authorName: 'Raphael Randek',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    likes: 12,
    isLiked: true,
    replies: 5,
    shares: 8,
    isShared: false
  },
  {
    id: '3',
    content: 'Quelqu\'un a des conseils pour optimiser la productivité ? 💡',
    authorId: '1',
    authorName: 'Raphael Randek',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    likes: 8,
    isLiked: false,
    replies: 12,
    shares: 4,
    isShared: false
  },
  {
    id: '4',
    content: 'Aujourd\'hui, j\'ai appris une nouvelle technique de développement. C\'est incroyable comme on peut toujours s\'améliorer ! 💪',
    authorId: '1',
    authorName: 'Raphael Randek',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    likes: 23,
    isLiked: false,
    replies: 7,
    shares: 15,
    isShared: false
  },
  {
    id: '5',
    content: 'Très bien, merci ! 😊',
    authorId: '2',
    authorName: 'Marie Dubois',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    likes: 2,
    isLiked: false,
    replies: 0,
    shares: 0,
    isShared: false,
    replyTo: '1',
    replyToAuthor: 'Raphael Randek'
  },
  {
    id: '6',
    content: 'Moi aussi je travaille sur un projet similaire !',
    authorId: '3',
    authorName: 'Thomas Martin',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    likes: 4,
    isLiked: false,
    replies: 2,
    shares: 1,
    isShared: false,
    replyTo: '2',
    replyToAuthor: 'Raphael Randek'
  },
  {
    id: '7',
    content: 'Je recommande la technique Pomodoro pour la productivité !',
    authorId: '4',
    authorName: 'Sophie Bernard',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 70),
    likes: 15,
    isLiked: true,
    replies: 3,
    shares: 6,
    isShared: false,
    replyTo: '3',
    replyToAuthor: 'Raphael Randek'
  },
  {
    id: '8',
    content: 'Super projet ! J\'aimerais voir le résultat final',
    authorId: '5',
    authorName: 'Alexandre Moreau',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 100),
    likes: 3,
    isLiked: false,
    replies: 1,
    shares: 0,
    isShared: false,
    replyTo: '2',
    replyToAuthor: 'Raphael Randek'
  },
  {
    id: '9',
    content: 'Je partage cette super idée !',
    authorId: '6',
    authorName: 'Emma Rousseau',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 110),
    likes: 7,
    isLiked: false,
    replies: 0,
    shares: 2,
    isShared: true,
    originalMessage: {
      id: '2',
      content: 'Je travaille sur un nouveau projet Kanban, c\'est vraiment sympa ! 📊',
      authorId: '1',
      authorName: 'Raphael Randek',
      authorAvatar: undefined,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      likes: 12,
      isLiked: true,
      replies: 5,
      shares: 8,
      isShared: false
    }
  },
  {
    id: '10',
    content: 'Excellente approche !',
    authorId: '7',
    authorName: 'Lucas Petit',
    authorAvatar: undefined,
    timestamp: new Date(Date.now() - 1000 * 60 * 130),
    likes: 5,
    isLiked: false,
    replies: 0,
    shares: 1,
    isShared: false,
    replyTo: '4',
    replyToAuthor: 'Raphael Randek'
  }
]

export const getMessagesForUser = (userId: string): Message[] => {
  return mockMessages.filter(msg => msg.authorId === userId)
}

export const getRepliesForMessage = (messageId: string): Message[] => {
  return mockMessages.filter(msg => msg.replyTo === messageId)
}

export const getSharedMessages = (): Message[] => {
  return mockMessages.filter(msg => msg.isShared)
}

export const addMessage = (message: Omit<Message, 'id' | 'timestamp' | 'likes' | 'isLiked' | 'replies' | 'shares' | 'isShared'>): Message => {
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date(),
    likes: 0,
    isLiked: false,
    replies: 0,
    shares: 0,
    isShared: false
  }
  
  mockMessages.unshift(newMessage)
  return newMessage
}

export const likeMessage = (messageId: string): void => {
  const message = mockMessages.find(msg => msg.id === messageId)
  if (message) {
    message.isLiked = !message.isLiked
    message.likes += message.isLiked ? 1 : -1
  }
}

export const shareMessage = (messageId: string, authorId: string, authorName: string): Message => {
  const originalMessage = mockMessages.find(msg => msg.id === messageId)
  if (!originalMessage) throw new Error('Message not found')
  
  const sharedMessage: Message = {
    id: Date.now().toString(),
    content: 'Je partage ce message !',
    authorId,
    authorName,
    authorAvatar: undefined,
    timestamp: new Date(),
    likes: 0,
    isLiked: false,
    replies: 0,
    shares: 0,
    isShared: true,
    originalMessage
  }
  
  originalMessage.shares += 1
  mockMessages.unshift(sharedMessage)
  return sharedMessage
}
