'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Message } from '@/types'

interface MessageCardProps {
  message: Message
  onLike: (messageId: string) => void
  onReply: (message: Message) => void
  onShare: (message: Message) => void
  onDelete?: (messageId: string) => void
  currentUserName: string
  replies?: Message[] // Réponses imbriquées
  onLoadReplies?: (messageId: string) => void // Fonction pour charger les réponses
}

export default function MessageCard({ 
  message, 
  onLike, 
  onReply, 
  onShare, 
  onDelete, 
  currentUserName,
  replies = [],
  onLoadReplies
}: MessageCardProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)

  const formatTime = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
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

  const isOwnMessage = message.authorName === currentUserName

  const handleToggleReplies = async () => {
    if (!showReplies && onLoadReplies && message.replies > 0) {
      setIsLoadingReplies(true)
      await onLoadReplies(message.id)
      setIsLoadingReplies(false)
    }
    setShowReplies(!showReplies)
  }

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      {/* Message partagé */}
      {message.isShared && message.originalMessage && (
        <div style={{
          backgroundColor: 'var(--bg-color)',
          borderRadius: '12px 12px 0 0',
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
          opacity: 0.8
        }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: message.originalMessage.authorAvatar ? 'transparent' : '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {message.originalMessage.authorAvatar ? (
                <img 
                  src={message.originalMessage.authorAvatar} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                message.originalMessage.authorName.charAt(0)
              )}
            </div>
            <div>
              <div style={{
                fontWeight: 'bold',
                color: 'var(--text-color)',
                fontSize: '14px'
              }}>
                {message.originalMessage.authorName}
              </div>
              <div style={{
                color: 'var(--text-color)',
                opacity: 0.7,
                fontSize: '12px'
              }}>
                {formatTime(message.originalMessage.timestamp)}
              </div>
            </div>
          </div>
          <p style={{
            color: 'var(--text-color)',
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {message.originalMessage.content}
          </p>
        </div>
      )}

      {/* Message principal */}
      <div style={{ padding: '20px' }}>
        {/* En-tête du message */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <Link href={`/profile/${message.authorId}`} style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: message.authorAvatar ? 'transparent' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            flexShrink: 0,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}>
            {message.authorAvatar ? (
              <img 
                src={message.authorAvatar} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              message.authorName.charAt(0)
            )}
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px'
            }}>
              <Link href={`/profile/${message.authorId}`} style={{
                fontWeight: 'bold',
                color: 'var(--text-color)',
                fontSize: '14px',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#3b82f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-color)'
              }}>
                {message.authorName}
              </Link>
              <span style={{
                color: 'var(--text-color)',
                opacity: 0.7,
                fontSize: '12px'
              }}>
                {formatTime(message.timestamp)}
              </span>
            </div>
            
            {/* Indicateur de réponse */}
            {message.replyToAuthor && (
              <div style={{
                color: 'var(--text-color)',
                opacity: 0.6,
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
                Répond à @{message.replyToAuthor}
              </div>
            )}
          </div>
        </div>

        {/* Contenu du message */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            color: 'var(--text-color)',
            margin: '0 0 12px 0',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {message.content}
          </p>
          
          {/* Images du message */}
          {message.images && message.images.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: message.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: '8px',
              marginTop: '12px'
            }}>
              {message.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    maxHeight: '300px'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions (like, répondre, partager) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => onLike(message.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: message.isLiked ? '#ef4444' : 'var(--text-color)',
              borderRadius: '20px',
              transition: 'all 0.2s ease'
            }}
            className="action-btn hover-lift"
          >
            <span style={{ fontSize: '16px' }}>
              {message.isLiked ? '❤️' : '🤍'}
            </span>
            <span style={{ fontSize: '14px' }}>
              {message.likes}
            </span>
          </button>
          
          <button
            onClick={() => onReply(message)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-color)',
              borderRadius: '20px',
              opacity: 0.7,
              transition: 'all 0.2s ease'
            }}
            className="action-btn hover-lift"
          >
            <span style={{ fontSize: '14px' }}>
              💬
            </span>
            <span style={{ fontSize: '14px' }}>
              {message.replies}
            </span>
          </button>
          
          <button
            onClick={() => onShare(message)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-color)',
              borderRadius: '20px',
              opacity: 0.7,
              transition: 'all 0.2s ease'
            }}
            className="action-btn hover-lift"
          >
            <span style={{ fontSize: '14px' }}>
              🔄
            </span>
            <span style={{ fontSize: '14px' }}>
              {message.shares}
            </span>
          </button>

          {/* Bouton de suppression pour ses propres messages */}
          {isOwnMessage && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                borderRadius: '20px',
                opacity: 0.7,
                transition: 'all 0.2s ease'
              }}
              className="action-btn hover-lift"
            >
              <span style={{ fontSize: '14px' }}>
                🗑️
              </span>
              <span style={{ fontSize: '14px' }}>
                Supprimer
              </span>
            </button>
          )}
        </div>

        {/* Bouton pour afficher/masquer les réponses */}
        {message.replies > 0 && (
          <button
            onClick={handleToggleReplies}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-color)',
              opacity: 0.7,
              fontSize: '14px',
              marginTop: '16px',
              transition: 'all 0.2s ease'
            }}
            className="show-replies-btn hover-lift"
          >
            <span style={{ fontSize: '16px' }}>
              {showReplies ? '▼' : '▶'}
            </span>
            <span>
              {isLoadingReplies ? 'Chargement...' : `${message.replies} réponses`}
            </span>
          </button>
        )}
      </div>

      {/* Réponses imbriquées */}
      {showReplies && replies.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-color)',
            marginBottom: '16px',
            opacity: 0.8
          }}>
            Réponses
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {replies.map((reply) => (
              <div
                key={reply.id}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  marginLeft: '20px',
                  position: 'relative'
                }}
                className="reply-item animate-fade-in"
              >
                {/* Ligne de connexion */}
                <div style={{
                  position: 'absolute',
                  left: '-20px',
                  top: '24px',
                  width: '20px',
                  height: '1px',
                  backgroundColor: 'var(--border-color)'
                }} />
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link href={`/profile/${reply.authorId}`} style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: reply.authorAvatar ? 'transparent' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}>
                    {reply.authorAvatar ? (
                      <img 
                        src={reply.authorAvatar} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      reply.authorName.charAt(0)
                    )}
                  </Link>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <Link href={`/profile/${reply.authorId}`} style={{
                        fontWeight: '600',
                        color: 'var(--text-color)',
                        fontSize: '14px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#3b82f6'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-color)'
                      }}>
                        {reply.authorName}
                      </Link>
                      <span style={{
                        color: 'var(--text-color)',
                        opacity: 0.7,
                        fontSize: '12px'
                      }}>
                        {formatTime(reply.timestamp)}
                      </span>
                    </div>
                    
                    <p style={{
                      color: 'var(--text-color)',
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {reply.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        .action-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          transform: scale(1.05);
        }
        
        .show-replies-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          opacity: 1 !important;
        }
        
        .reply-item {
          transition: all 0.3s ease;
        }
        
        .reply-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Animation d'apparition des réponses */
        .reply-item {
          animation: fadeInLeft 0.4s ease-out;
        }
        
        /* Effet de focus pour l'accessibilité */
        .action-btn:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Transitions fluides */
        .task-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Effet de survol pour les boutons d'action */
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
      `}</style>
    </div>
  )
}
