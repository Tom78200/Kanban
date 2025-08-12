'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Message } from '@/types'

interface ReplyModalProps {
  isOpen: boolean
  onClose: () => void
  onReply: (content: string) => void
  originalMessage: Message
  currentUserName: string
}

export default function ReplyModal({ isOpen, onClose, onReply, originalMessage, currentUserName }: ReplyModalProps) {
  const [replyContent, setReplyContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    
    onReply(replyContent.trim())
    setReplyContent('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'var(--text-color)',
            margin: 0
          }}>
            Répondre
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-color)',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Message original */}
        <div style={{
          backgroundColor: 'var(--bg-color)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <Link href={`/profile/${originalMessage.authorId}`} style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: originalMessage.authorAvatar ? 'transparent' : '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
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
              {originalMessage.authorAvatar ? (
                <img 
                  src={originalMessage.authorAvatar} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                originalMessage.authorName.charAt(0)
              )}
            </Link>
            <div>
              <Link href={`/profile/${originalMessage.authorId}`} style={{
                fontWeight: 'bold',
                color: 'var(--text-color)',
                fontSize: '14px',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                display: 'block',
                marginBottom: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#3b82f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-color)'
              }}>
                {originalMessage.authorName}
              </Link>
              <div style={{
                color: 'var(--text-color)',
                opacity: 0.7,
                fontSize: '12px'
              }}>
                {(() => {
                  const d = typeof originalMessage.timestamp === 'string' ? new Date(originalMessage.timestamp) : originalMessage.timestamp
                  return d.toLocaleString('fr-FR')
                })()}
              </div>
            </div>
          </div>
          <p style={{
            color: 'var(--text-color)',
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {originalMessage.content}
          </p>
        </div>

        {/* Formulaire de réponse */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Répondre à ${originalMessage.authorName}...`}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  resize: 'vertical',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  fontFamily: 'inherit'
                }}
                autoFocus
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-color)'
                  }}>
                    😊
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: replyContent.trim() ? '#3b82f6' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                    opacity: replyContent.trim() ? 1 : 0.6
                  }}
                >
                  Répondre
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

