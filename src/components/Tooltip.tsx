'use client'

import { useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export default function Tooltip({ 
  children, 
  content, 
  position = 'top', 
  delay = 300 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setIsVisible(false)
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
      whiteSpace: 'nowrap' as const,
      fontSize: '12px',
      fontWeight: '500',
      padding: '8px 12px',
      borderRadius: '8px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(12px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'scale(1)' : 'scale(0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
      color: 'white',
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: isVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)',
          marginBottom: '8px',
        }
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: isVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)',
          marginTop: '8px',
        }
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: isVisible ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.95)',
          marginRight: '8px',
        }
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: isVisible ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.95)',
          marginLeft: '8px',
        }
      default:
        return baseStyles
    }
  }

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          style={{
            ...getPositionStyles(),
          }}
        >
          {content}
          {/* Arrow avec animation */}
          <div
            style={{
              position: 'absolute',
              width: '0',
              height: '0',
              transition: 'all 0.3s ease',
              ...(position === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(17, 24, 39, 0.95)',
              }),
              ...(position === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid rgba(17, 24, 39, 0.95)',
              }),
              ...(position === 'left' && {
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderLeft: '6px solid rgba(17, 24, 39, 0.95)',
              }),
              ...(position === 'right' && {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid rgba(17, 24, 39, 0.95)',
              }),
            }}
          />
        </div>
      )}
    </div>
  )
}
