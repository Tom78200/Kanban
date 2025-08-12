export interface Message {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  image?: string
  images?: string[]
  timestamp: string | Date
  likes: number
  isLiked: boolean
  replies: number
  shares: number
  isShared: boolean
  originalMessage?: Message
  replyToId?: string
  replyToAuthor?: string
}

export interface UserPublic {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  followers: number
  isFollowing: boolean
}


