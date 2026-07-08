import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconColor?: string
  iconBg?: string
  valueColor?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = '#fb923c',
  iconBg = 'rgba(234, 88, 12, 0.1)',
  valueColor,
}: StatCardProps) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: 'var(--radius-md)',
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} strokeWidth={2} />
      </div>
      <div>
        <p style={{
          margin: 0,
          fontSize: 'var(--text-xs)',
          color: 'var(--color-muted)',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>{label}</p>
        <p style={{
          margin: '4px 0 0',
          fontSize: 'var(--text-2xl)',
          color: valueColor || 'var(--color-cream)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
        }}>{value}</p>
      </div>
    </Card>
  )
}
