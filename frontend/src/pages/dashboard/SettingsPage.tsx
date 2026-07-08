// src/pages/dashboard/SettingsPage.tsx
import { useEffect, useState } from 'react'
import { useThemeStore } from '../../store/themeStore'
import { useAuthStore } from '../../store/authStore'
import { authAPI } from '../../api/auth'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { toast } from 'react-hot-toast'
import { User, Bell, Shield, Sun, Moon, Key, Copy, Check, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()
  const dark = theme === 'dark'

  const [tenant, setTenant] = useState<{ id: string; name: string; api_key: string; plan: string } | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    authAPI.getTenantMe()
      .then(res => setTenant(res))
      .catch(err => console.error("Failed to load tenant details:", err))
  }, [])

  const copyKey = () => {
    if (!tenant) return
    navigator.clipboard.writeText(tenant.api_key)
    setCopied(true)
    toast.success('API key copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

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

        {/* API Credentials Section */}
        <Card style={{
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={18} color="#fb923c" strokeWidth={2} />
            <h2 style={{
              margin: 0, fontSize: 16, fontWeight: 700,
              color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
            }}>API Keys</h2>
          </div>

          <div>
            <p style={{
              margin: 0, fontSize: 14, color: 'var(--color-cream)', fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}>Public API Key</p>
            <p style={{
              margin: '2px 0 12px', fontSize: 13, color: 'var(--color-muted)',
              fontFamily: 'var(--font-body)',
            }}>
              Authenticate your embed widget. Keep this key secret.
            </p>

            {tenant ? (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                background: 'var(--dash-input-bg)', border: '1px solid var(--dash-input-border)',
                borderRadius: 10, padding: '10px 14px',
              }}>
                <code style={{
                  flex: 1, color: '#fb923c', fontSize: 13, fontFamily: 'monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {showKey ? tenant.api_key : '•'.repeat(40)}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? "Hide API key" : "Show API key"}
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4,
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div style={{ width: 1, height: 16, background: 'var(--dash-card-border)' }} />
                <button
                  onClick={copyKey}
                  title="Copy API key"
                  style={{
                    background: 'none', border: 'none', color: copied ? '#4ade80' : 'var(--color-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4,
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>Loading credentials...</p>
            )}
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
