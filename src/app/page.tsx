'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          backgroundColor: '#000000', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '32px' }}>T</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000000', margin: '0 0 16px' }}>
          TaskMaster Pro
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px' }}>
          Professional task management for teams
        </p>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          Loading...
        </div>
      </div>
    </div>
  )
}
