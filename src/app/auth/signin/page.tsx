'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        } else {
          setError('Session not created. Please try again.')
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      })
      
      if (result?.error) {
        setError('Google sign in failed. Please try again.')
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            backgroundColor: '#000000', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>T</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', margin: '0 0 8px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Sign in to your TaskMaster Pro account
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Séparateur */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Bouton Google - Désactivé temporairement */}
        {/* <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#9ca3af'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#d1d5db'
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button> */}

        {/* Liens */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px' }}>
            Don't have an account?{' '}
            <Link href="/auth/signup" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Sign up
            </Link>
          </p>
          <Link href="/auth/forgot-password" style={{
            fontSize: '14px',
            color: '#6b7280',
            textDecoration: 'none'
          }}>
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
} 