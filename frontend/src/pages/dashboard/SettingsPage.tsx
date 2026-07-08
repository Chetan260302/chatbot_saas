// src/pages/dashboard/SettingsPage.tsx
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { User, Bell, Shield, Sun, Moon } from 'lucide-react'

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()
  const dark = theme === 'dark'

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences."
        />

        {/* Profile section */}
        <Card style={{
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={18} color="#fb923c" strokeWidth={2} />
            <h2 style={{
              margin: 0, fontSize: 16, fontWeight: 700,
              color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
            }}>Profile</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 16px', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>Name</span>
            <span style={{ fontSize: 14, color: 'var(--color-cream)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
              {user?.full_name || '—'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>Email</span>
            <span style={{ fontSize: 14, color: 'var(--color-cream)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
              {user?.email || '—'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>Role</span>
            <Badge variant="secondary" style={{ width: 'fit-content', textTransform: 'uppercase' }}>
              {user?.role || '—'}
            </Badge>
          </div>
        </Card>

        {/* Appearance section */}
        <Card style={{
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {dark ? <Moon size={18} color="#60a5fa" strokeWidth={2} /> : <Sun size={18} color="#f59e0b" strokeWidth={2} />}
            <h2 style={{
              margin: 0, fontSize: 16, fontWeight: 700,
              color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
            }}>Appearance</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{
                margin: 0, fontSize: 14, color: 'var(--color-cream)', fontWeight: 600,
                fontFamily: 'var(--font-body)',
              }}>Theme</p>
              <p style={{
                margin: '2px 0 0', fontSize: 13, color: 'var(--color-muted)',
                fontFamily: 'var(--font-body)',
              }}>
                Currently using {dark ? 'dark' : 'light'} mode
              </p>
            </div>
            <button onClick={toggleTheme} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: dark ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
              borderRadius: 8, padding: '8px 16px',
              color: dark ? '#60a5fa' : '#f59e0b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              {dark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </Card>

        {/* Coming soon sections */}
        {[
          { icon: Bell,   label: 'Notifications', desc: 'Configure email and in-app notification preferences.' },
          { icon: Shield, label: 'Security',      desc: 'Two-factor authentication and session management.' },
        ].map(({ icon: Icon, label, desc }) => (
          <Card key={label} style={{
            opacity: 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Icon size={18} color="var(--color-muted)" strokeWidth={2} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
              }}>{label}</h2>
              <Badge variant="secondary">COMING SOON</Badge>
            </div>
            <p style={{
              margin: 0, fontSize: 14, color: 'var(--color-muted)',
              fontFamily: 'var(--font-body)',
            }}>{desc}</p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
