'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import SuggestedUsers from '@/components/SuggestedUsers'
import MessageCard from '@/components/MessageCard'
import ReplyModal from '@/components/ReplyModal'
import Tooltip from '@/components/Tooltip'

import { Message, UserPublic } from '@/types'

// Types centralisés

export default function Dashboard() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [replyModal, setReplyModal] = useState<{ isOpen: boolean; message: any }>({ isOpen: false, message: null })
  const [suggestedUsers, setSuggestedUsers] = useState<UserPublic[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [messageReplies, setMessageReplies] = useState<Record<string, Message[]>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Charger les messages depuis l'API (support q)
  const loadMessages = async (q?: string) => {
    try {
      const url = q && q.trim() ? `/api/messages?q=${encodeURIComponent(q.trim())}` : '/api/messages'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  // Charger les utilisateurs depuis l'API
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setSuggestedUsers(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  // Charger les réponses d'un message spécifique
  const loadMessageReplies = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/replies`)
      if (response.ok) {
        const replies = await response.json()
        setMessageReplies(prev => ({
          ...prev,
          [messageId]: replies
        }))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error)
    }
  }

  // Initialiser les données
  useEffect(() => {
    if (session?.user) {
      loadMessages()
      loadUsers()
    }
  }, [session])

  // Debounce recherche côté serveur
  useEffect(() => {
    if (!session?.user) return
    const controller = new AbortController()
    const id = setTimeout(() => {
      loadMessages(searchTerm)
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(id)
    }
  }, [searchTerm, session])

  // Fonction pour redimensionner une image
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Définir la taille maximale
        const maxWidth = 800
        const maxHeight = 600
        
        let { width, height } = img
        
        // Redimensionner si nécessaire
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir en base64 avec compression
        const resizedImage = canvas.toDataURL('image/jpeg', 0.8)
        resolve(resizedImage)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Gérer la sélection d'image
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    try {
      const resized = [] as string[]
      for (const file of files.slice(0, 2 - selectedImages.length)) {
        const img = await resizeImage(file)
        resized.push(img)
      }
      setSelectedImages(prev => [...prev, ...resized].slice(0, 2))
    } catch (error) {
      console.error('Erreur lors du redimensionnement:', error)
    }
  }

  // Supprimer l'image sélectionnée
  const removeSelectedImage = (idx?: number) => {
    if (typeof idx === 'number') setSelectedImages(prev => prev.filter((_, i) => i !== idx))
    else setSelectedImages([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && selectedImages.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            content: newMessage.trim(),
            images: selectedImages
          }),
      })

      if (response.ok) {
        const newMessageObj = await response.json()
        setMessages(prev => [newMessageObj, ...prev])
        setNewMessage('')
        setSelectedImages([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? Math.max(0, m.likes - 1) : m.likes + 1 } : m))
    try {
      const target = messages.find(m => m.id === messageId)
      const method = target?.isLiked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/messages/${messageId}/like`, { method })
      if (!res.ok) throw new Error('like failed')
      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLiked: data.isLiked, likes: data.likes } : m))
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? m.likes + 1 : Math.max(0, m.likes - 1) } : m))
    }
  }

  const handleReply = (message: Message) => {
    setReplyModal({ isOpen: true, message })
  }

  const handleReplySubmit = async (content: string) => {
    if (!replyModal.message || !session?.user) return
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          replyToId: replyModal.message.id,
          replyToAuthor: replyModal.message.authorName
        })
      })

      if (response.ok) {
        const newReply = await response.json()
        
        // Ajouter la réponse à la liste des réponses du message parent
        setMessageReplies(prev => ({
          ...prev,
          [replyModal.message.id]: [
            newReply,
            ...(prev[replyModal.message.id] || [])
          ]
        }))
        
        // Mettre à jour le compteur de réponses du message parent
        setMessages(prev => prev.map(msg => 
          msg.id === replyModal.message.id 
            ? { ...msg, replies: msg.replies + 1 }
            : msg
        ))
        
        setReplyModal({ isOpen: false, message: null })
      }
    } catch (error) {
      console.error('Erreur lors de la création de la réponse:', error)
    }
  }

  const handleShare = (message: Message) => {
    // TODO: Implémenter le système de partage
    console.log('Share message:', message.id)
  }

  const handleDelete = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error)
    }
  }

  return (
    <div style={{ 
      display: 'flex',
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: 'var(--bg-color)',
      minHeight: '100vh',
      gap: '32px'
    }} className="animate-fade-in">
      {/* Contenu principal */}
      <div style={{ flex: 1, maxWidth: '600px' }} className="animate-fade-in-up">
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--bg-color)',
          padding: '16px 0',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 10
        }} className="animate-slide-in-top">
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'var(--text-color)',
            margin: '0 0 16px 0'
          }}>
            🏠 Accueil
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-color)', 
            margin: '4px 0 0 0',
            opacity: 0.7
          }}>
            Fil d'actualité général
          </p>
          
          {/* Barre de recherche */}
          <div style={{
            marginTop: '16px',
            position: 'relative'
          }} className="animate-fade-in-up">
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                fontSize: '14px',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-color)',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                className="clear-search-btn hover-lift"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Zone de saisie de message */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '20px',
          margin: '20px 0',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease'
        }} className="message-input-card card-hover animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: session?.user?.avatar ? 'transparent' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0,
                transition: 'all 0.3s ease'
              }} className="user-avatar hover-lift">
                {session?.user?.avatar ? (
                  <img 
                    src={session.user.avatar} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  session?.user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Quoi de neuf ?"
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    resize: 'vertical',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease'
                  }}
                  className="message-textarea"
                />
                
                {/* Image sélectionnée */}
            {selectedImages.length > 0 && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }} className="animate-fade-in">
                {selectedImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', display: 'inline-block' }} className="selected-image-container">
                    <img src={img} alt={`Image ${idx+1}`} style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeSelectedImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }} className="remove-image-btn hover-lift">✕</button>
                  </div>
                ))}
              </div>
            )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <Tooltip content="Ajouter des images" position="top">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ 
                          padding: '8px', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: 'var(--text-color)' 
                        }}
                      >
                        🖼️
                      </button>
                    </Tooltip>

                  </div>
          <button
                    type="submit"
            disabled={(!newMessage.trim() && selectedImages.length === 0) || isLoading}
                    style={{
                      padding: '8px 16px',
                    backgroundColor: (newMessage.trim() || selectedImages.length > 0) ? '#3b82f6' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    cursor: (newMessage.trim() || selectedImages.length > 0) ? 'pointer' : 'not-allowed',
                    opacity: (newMessage.trim() || selectedImages.length > 0) ? 1 : 0.6
                    }}
                  >
                    {isLoading ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fil de messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onLike={handleLike}
                onReply={handleReply}
                onShare={handleShare}
                onDelete={handleDelete}
                currentUserName={session?.user?.name || 'User'}
                replies={messageReplies[message.id] || []}
                onLoadReplies={loadMessageReplies}
              />
            ))
          ) : searchTerm ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-color)',
              opacity: 0.6
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Aucun message trouvé pour "{searchTerm}"
              </p>
            </div>
          ) : null}
        </div>

        {/* Message de fin */}
        {!searchTerm && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-color)',
            opacity: 0.6
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Vous avez atteint la fin du fil d'actualité
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ 
        width: '300px', 
        flexShrink: 0,
        position: 'sticky',
        top: '20px',
        height: 'fit-content'
      }}>
        <SuggestedUsers users={suggestedUsers} />
      </div>

      {/* Modal de réponse */}
      {replyModal.isOpen && replyModal.message && (
        <ReplyModal
          isOpen={replyModal.isOpen}
          onClose={() => setReplyModal({ isOpen: false, message: null })}
          onReply={handleReplySubmit}
          originalMessage={replyModal.message}
          currentUserName={session?.user?.name || 'User'}
        />
      )}
      {/* Styles CSS personnalisés pour les animations */}
      <style jsx>{`
        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: scale(1.02);
        }
        
        .message-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: scale(1.01);
        }
        
        .user-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .selected-image-container {
          transition: all 0.3s ease;
        }
        
        .selected-image-container:hover {
          transform: scale(1.05);
        }
        
        .remove-image-btn:hover {
          background: rgba(239, 68, 68, 0.9) !important;
          transform: scale(1.1);
        }
        
        .clear-search-btn:hover {
          color: #ef4444;
          transform: scale(1.1);
        }
        
        .message-input-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        /* Animation d'apparition progressive des messages */
        .message-item {
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        
        .message-item:nth-child(1) { animation-delay: 0.1s; }
        .message-item:nth-child(2) { animation-delay: 0.2s; }
        .message-item:nth-child(3) { animation-delay: 0.3s; }
        .message-item:nth-child(4) { animation-delay: 0.4s; }
        .message-item:nth-child(5) { animation-delay: 0.5s; }
        
        /* Effet de brillance sur les boutons */
        .action-btn {
          position: relative;
          overflow: hidden;
        }
        
        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .action-btn:hover::before {
          left: 100%;
        }
        
        /* Animation de pulsation pour les notifications */
        .notification-dot {
          animation: pulse 2s infinite;
        }
        
        /* Effet de survol pour les cartes utilisateur */
        .user-card {
          transition: all 0.3s ease;
        }
        
        .user-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* Animation de chargement */
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        /* Effet de focus amélioré */
        .focus-ring:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        
        /* Transitions fluides pour tous les éléments interactifs */
        button, input, textarea, select {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Effet de survol pour les liens */
        a {
          transition: all 0.2s ease;
        }
        
        a:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
