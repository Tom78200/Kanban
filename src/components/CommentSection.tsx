'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string
    avatar?: string
  }
}

interface CommentSectionProps {
  taskId: string
  comments: Comment[]
  onAddComment: (taskId: string, content: string) => Promise<void>
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
}

export default function CommentSection({ taskId, comments, onAddComment, currentUser }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddComment(taskId, newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const commentDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'À l\'instant'
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`
    } else if (diffInHours < 48) {
      return 'Hier'
    } else {
      return commentDate.toLocaleDateString('fr-FR')
    }
  }

  const displayedComments = showAllComments ? comments : comments.slice(-3)

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          💬 Commentaires ({comments.length})
        </h4>
      </div>

      {/* Liste des commentaires */}
      <div style={{ marginBottom: '16px' }}>
        {comments.length === 0 ? (
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            fontStyle: 'italic',
            margin: '16px 0'
          }}>
            Aucun commentaire pour le moment
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedComments.map((comment) => (
              <div key={comment.id} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e5e7eb'
              }}>
                {/* Header du commentaire */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: comment.user.avatar ? 'transparent' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: '500',
                    overflow: 'hidden'
                  }}>
                    {comment.user.avatar ? (
                      <img 
                        src={comment.user.avatar} 
                        alt={comment.user.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      comment.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      {comment.user.name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#6b7280'
                    }}>
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Contenu du commentaire */}
                <div style={{
                  fontSize: '13px',
                  color: '#374151',
                  lineHeight: '1.4'
                }}>
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bouton pour voir plus/moins de commentaires */}
        {comments.length > 3 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'underline'
            }}
          >
            {showAllComments ? 'Voir moins' : `Voir ${comments.length - 3} commentaires précédents`}
          </button>
        )}
      </div>

      {/* Formulaire d'ajout de commentaire */}
      <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: currentUser.avatar ? 'transparent' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            fontWeight: '500',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '8px'
            }}>
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                style={{
                  padding: '6px 12px',
                  backgroundColor: !newComment.trim() || isSubmitting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: !newComment.trim() || isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Envoi...' : 'Commenter'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}



