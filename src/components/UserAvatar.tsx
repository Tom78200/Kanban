'use client'

import Link from 'next/link'

interface UserAvatarProps {
  user: {
    id: string
    name: string
    avatar?: string
  }
  size?: 'small' | 'medium' | 'large'
  showName?: boolean
}

export default function UserAvatar({ user, size = 'medium', showName = false }: UserAvatarProps) {
  const sizeMap = {
    small: { width: '24px', height: '24px', fontSize: '12px' },
    medium: { width: '32px', height: '32px', fontSize: '14px' },
    large: { width: '40px', height: '40px', fontSize: '16px' }
  }

  const { width, height, fontSize } = sizeMap[size]

  return (
    <Link href={`/profile/${user.id}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
      color: 'var(--text-color)'
    }}>
      <div style={{
        width,
        height,
        borderRadius: '50%',
        backgroundColor: user.avatar ? 'transparent' : '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize,
        fontWeight: 'bold',
        cursor: 'pointer',
        flexShrink: 0
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
      {showName && (
        <span style={{ 
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          {user.name}
        </span>
      )}
    </Link>
  )
}


