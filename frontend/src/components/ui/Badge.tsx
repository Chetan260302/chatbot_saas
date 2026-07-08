import React from 'react'

type BadgeVariant = 'success' | 'warning' | 'info' | 'secondary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: React.CSSProperties
}

export function Badge({ children, variant = 'secondary', style }: BadgeProps) {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return {
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#4ade80',
          border: '1px solid rgba(34, 197, 94, 0.15)',
        }
      case 'warning':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#fca5a5',
          border: '1px solid rgba(239, 68, 68, 0.15)',
        }
      case 'info':
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.15)',
        }
      case 'secondary':
      default:
        return {
          background: 'rgba(120, 113, 108, 0.1)',
          color: '#a8a29e',
          border: '1px solid rgba(120, 113, 108, 0.15)',
        }
    }
  }

  return (
    <span style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-body)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      ...getStyles(),
      ...style,
    }}>
      {children}
    </span>
  )
}
