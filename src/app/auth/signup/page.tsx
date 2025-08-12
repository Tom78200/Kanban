'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Redirect to sign in page
      router.push('/auth/signin?message=Account created successfully! Please sign in.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      })

      if (result?.error) {
        setError('Google sign up failed. Please try again.')
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
            Create your account
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Join TaskMaster Pro and start managing your projects
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
            <label htmlFor="name" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your full name"
            />
          </div>

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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Confirm your password"
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
            {isLoading ? 'Creating account...' : 'Create account'}
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

        {/* Bouton Google */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          {isLoading ? 'Creating account...' : 'Continue with Google'}
        </button>

        {/* Liens */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/auth/signin" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 