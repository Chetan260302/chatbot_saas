// src/pages/dashboard/AnalyticsPage.tsx
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { BarChart3, TrendingUp, MessageSquare, Clock } from 'lucide-react'

export default function AnalyticsPage() {
  const PLACEHOLDER_STATS = [
    { icon: MessageSquare, label: 'Total Conversations', value: '—', color: '#fb923c', bg: 'rgba(234,88,12,0.1)' },
    { icon: TrendingUp,    label: 'Response Rate',       value: '—', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
    { icon: Clock,         label: 'Avg. Response Time',  value: '—', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  ]

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <PageHeader
          title="Analytics"
          subtitle="Track chatbot performance and usage metrics."
        />

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {PLACEHOLDER_STATS.map(({ icon: Icon, label, value, color, bg }) => (
            <StatCard
              key={label}
              icon={Icon}
              label={label}
              value={value}
              iconColor={color}
              iconBg={bg}
            />
          ))}
        </div>

        {/* Coming soon card */}
        <Card style={{
          padding: '56px 24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(59,130,246,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart3 size={28} color="#60a5fa" strokeWidth={1.5} />
          </div>
          <div>
            <h3 style={{
              margin: '0 0 6px', fontSize: 18, color: 'var(--color-cream)',
              fontFamily: 'var(--font-display)', fontWeight: 800,
            }}>Analytics coming soon</h3>
            <p style={{
              margin: 0, color: 'var(--color-muted)', fontSize: 14,
              fontFamily: 'var(--font-body)', maxWidth: 400,
            }}>
              Detailed conversation analytics, token usage trends, and performance
              metrics will be available here.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
