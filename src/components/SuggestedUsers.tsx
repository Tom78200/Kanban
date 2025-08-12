'use client'

import { useState } from 'react'
import Link from 'next/link'

import { UserPublic as SuggestedUser } from '@/types'

interface SuggestedUsersProps {
  users: SuggestedUser[]
}

export default function SuggestedUsers({ users }: SuggestedUsersProps) {
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const handleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
    // Appel API follow/unfollow
    const isNowFollowing = !followedUsers.has(userId)
    fetch(`/api/users/${userId}/follow`, { method: isNowFollowing ? 'POST' : 'DELETE' })
      .then(res => res.json())
      .catch(() => {})
  }

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: 'var(--text-color)',
        margin: '0 0 16px 0'
      }}>
        Qui suivre
      </h3>

      {/* Barre de recherche */}
      <div style={{
        marginBottom: '16px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Rechercher des utilisateurs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            fontSize: '12px',
            backgroundColor: 'var(--input-bg)',
            color: 'var(--text-color)',
            outline: 'none'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-color)',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isFollowing = followedUsers.has(user.id)
            
            return (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Link href={`/profile/${user.id}`}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: user.avatar ? 'transparent' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
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
                </Link>
                
                <div style={{ flex: 1 }}>
                  <Link href={`/profile/${user.id}`} style={{
                    textDecoration: 'none',
                    color: 'var(--text-color)'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {user.name}
                    </div>
                  </Link>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-color)', 
                    opacity: 0.7,
                    marginTop: '2px'
                  }}>
                    {user.followers} projets
                  </div>
                  {user.bio && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-color)', 
                      opacity: 0.6,
                      marginTop: '2px'
                    }}>
                      {user.bio}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleFollow(user.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isFollowing ? 'transparent' : '#3b82f6',
                    color: isFollowing ? 'var(--text-color)' : 'white',
                    border: isFollowing ? '1px solid var(--border-color)' : 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </button>
              </div>
            )
          })
        ) : searchTerm ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: 'var(--text-color)',
            opacity: 0.6,
            fontSize: '12px'
          }}>
            Aucun utilisateur trouvé pour "{searchTerm}"
          </div>
        ) : users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: 'var(--text-color)',
            opacity: 0.6,
            fontSize: '12px'
          }}>
            Aucun utilisateur disponible
          </div>
        ) : (
          users.map((user) => {
            const isFollowing = followedUsers.has(user.id)
            
            return (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Link href={`/profile/${user.id}`}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: user.avatar ? 'transparent' : '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
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
                </Link>
                
                <div style={{ flex: 1 }}>
                  <Link href={`/profile/${user.id}`} style={{
                    textDecoration: 'none',
                    color: 'var(--text-color)'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {user.name}
                    </div>
                  </Link>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-color)', 
                    opacity: 0.7,
                    marginTop: '2px'
                  }}>
                    {user.followers} projets
                  </div>
                  {user.bio && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-color)', 
                      opacity: 0.6,
                      marginTop: '2px'
                    }}>
                      {user.bio}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleFollow(user.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isFollowing ? 'transparent' : '#3b82f6',
                    color: isFollowing ? 'var(--text-color)' : 'white',
                    border: isFollowing ? '1px solid var(--border-color)' : 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
