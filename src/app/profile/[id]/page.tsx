'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MessageCard from '@/components/MessageCard'
import ProfileEditModal from '@/components/ProfileEditModal'
import { Message, UserPublic } from '@/types'

export default function UserProfile() {
  const { data: session } = useSession()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<UserPublic | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const [editModal, setEditModal] = useState(false)

  // Charger l'utilisateur et ses messages depuis l'API
  useEffect(() => {
    const load = async () => {
      try {
        // Charger l'utilisateur par ID
        const resUser = await fetch(`/api/users/${userId}`)
        if (resUser.ok) {
          const userData = await resUser.json()
          setUser(userData)
          
          // Charger les messages de cet utilisateur
          const resMsgs = await fetch(`/api/messages?authorId=${userId}`)
          const msgs: Message[] = resMsgs.ok ? await resMsgs.json() : []
          setMessages(msgs)
        } else {
          setUser(null)
          setMessages([])
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        setUser(null)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const handleFollow = async () => {
    if (!user) return
    const willFollow = !user.isFollowing
    setUser(prev => prev ? { ...prev, isFollowing: willFollow, followers: willFollow ? prev.followers + 1 : Math.max(0, prev.followers - 1) } : prev)
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, { method: willFollow ? 'POST' : 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        setUser(prev => prev ? { ...prev, isFollowing: data.isFollowing, followers: data.followers } : prev)
      }
    } catch {}
  }

  const handleLike = (messageId: string) => {
    // Mettre à jour le message dans la liste locale
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1,
              isLiked: !msg.isLiked 
            }
          : msg
      )
    )
  }

  const handleReply = (message: Message) => {
    // Rediriger vers le dashboard pour répondre
    window.location.href = '/dashboard'
  }

  const handleShare = (message: Message) => {
    // Rediriger vers le dashboard pour partager
    window.location.href = '/dashboard'
  }

  const handleProfileEdit = (userData: Partial<MockUser>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes}m`
    if (hours < 24) return `Il y a ${hours}h`
    return `Il y a ${days}j`
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement du profil...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Utilisateur non trouvé</p>
      </div>
    )
  }

  const isOwnProfile = session?.user?.email === user?.email

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh'
    }}>
      {/* Header avec bouton retour */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-color)',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Link href="/dashboard" style={{
          padding: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-color)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          width: '32px',
          height: '32px'
        }}>
          ←
        </Link>
        <div>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: 'var(--text-color)',
            margin: 0
          }}>
            {user.name}
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-color)', 
            margin: '2px 0 0 0',
            opacity: 0.7
          }}>
            {user.posts} posts
          </p>
        </div>
      </div>

      {/* Photo de couverture */}
      <div style={{
        height: '200px',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }} />

      {/* Informations du profil */}
      <div style={{ padding: '0 20px' }}>
        {/* Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: user.avatar ? 'transparent' : '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '32px',
          fontWeight: 'bold',
          border: '4px solid var(--bg-color)',
          marginTop: '-40px',
          position: 'relative',
          zIndex: 2
        }}>
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Bouton Suivre/Modifier */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                     {isOwnProfile ? (
             <button
               onClick={() => setEditModal(true)}
               style={{
                 padding: '8px 16px',
                 backgroundColor: 'var(--card-bg)',
                 color: 'var(--text-color)',
                 border: '1px solid var(--border-color)',
                 borderRadius: '20px',
                 fontSize: '14px',
                 fontWeight: 'bold',
                 cursor: 'pointer'
               }}
             >
               Modifier le profil
             </button>
           ) : (
            <button
              onClick={handleFollow}
              style={{
                padding: '8px 16px',
                backgroundColor: user.isFollowing ? 'transparent' : '#3b82f6',
                color: user.isFollowing ? 'var(--text-color)' : 'white',
                border: user.isFollowing ? '1px solid var(--border-color)' : 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {user.isFollowing ? 'Ne plus suivre' : 'Suivre'}
            </button>
          )}
        </div>

        {/* Informations utilisateur */}
        <div style={{ marginTop: '16px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: 'var(--text-color)',
            margin: '0 0 4px 0'
          }}>
            {user.name}
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-color)', 
            margin: '0 0 12px 0',
            opacity: 0.7
          }}>
            @{user.email.split('@')[0]}
          </p>
          {user.bio && (
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-color)', 
              margin: '0 0 12px 0',
              lineHeight: '1.5'
            }}>
              {user.bio}
            </p>
          )}

          {/* Statistiques */}
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--text-color)'
          }}>
            <span style={{ cursor: 'pointer' }}>
              <strong>{user.following}</strong> Abonnements
            </span>
            <span style={{ cursor: 'pointer' }}>
              <strong>{user.followers}</strong> Abonnés
            </span>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)',
          marginTop: '16px'
        }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              color: activeTab === 'posts' ? 'var(--text-color)' : 'var(--text-color)',
              opacity: activeTab === 'posts' ? 1 : 0.7,
              borderBottom: activeTab === 'posts' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('replies')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              color: activeTab === 'replies' ? 'var(--text-color)' : 'var(--text-color)',
              opacity: activeTab === 'replies' ? 1 : 0.7,
              borderBottom: activeTab === 'replies' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Réponses
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              color: activeTab === 'likes' ? 'var(--text-color)' : 'var(--text-color)',
              opacity: activeTab === 'likes' ? 1 : 0.7,
              borderBottom: activeTab === 'likes' ? '2px solid #3b82f6' : 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            J'aime
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div style={{ padding: '0 20px' }}>
        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onLike={handleLike}
                onReply={handleReply}
                onShare={handleShare}
                currentUserName={session?.user?.name || 'User'}
              />
            ))}
          </div>
        )}

        {activeTab === 'replies' && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              Aucune réponse pour le moment
            </p>
          </div>
        )}

        {activeTab === 'likes' && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-color)', opacity: 0.7 }}>
              Aucun like pour le moment
            </p>
          </div>
                 )}
       </div>

       {/* Modal d'édition de profil */}
       {editModal && user && (
         <ProfileEditModal
           isOpen={editModal}
           onClose={() => setEditModal(false)}
           onSave={handleProfileEdit}
           currentUser={user}
         />
       )}
     </div>
   )
 }
