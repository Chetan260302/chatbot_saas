import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverable?: boolean
}

export function Card({ children, hoverable = false, style, ...props }: CardProps) {
  const [hover, setHover] = React.useState(false)

  return (
    <div
      onMouseEnter={() => hoverable && setHover(true)}
      onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: 'var(--dash-card)',
        border: '1px solid var(--dash-card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxSizing: 'border-box',
        transition: 'all var(--duration-fast) var(--ease-smooth)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 12px 32px rgba(0,0,0,0.12)' : 'none',
        borderColor: hover ? 'rgba(234, 88, 12, 0.35)' : 'var(--dash-card-border)',
        backgroundColor: hover ? 'var(--dash-card-hover)' : 'var(--dash-card)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
