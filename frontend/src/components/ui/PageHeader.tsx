import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-cream)',
          margin: '0 0 6px',
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            color: 'var(--color-muted)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            margin: 0,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {action}
        </div>
      )}
    </div>
  )
}
