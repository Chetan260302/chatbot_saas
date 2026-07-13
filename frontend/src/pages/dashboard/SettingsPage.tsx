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
import { User, Bell, Shield, Sun, Moon, Key, Copy, Check, Eye, EyeOff, Lock, Zap } from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()
  const { canViewApiKey, canViewBilling } = usePermissions()
  const dark = theme === 'dark'

  const [tenant, setTenant] = useState<{ id: string; name: string; api_key: string; plan: string } | null>(null)
  const [usage, setUsage] = useState<any | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  // Change Password Form State
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' })
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      authAPI.getTenantMe().then(res => setTenant(res)),
      authAPI.getTenantUsage().then(res => setUsage(res)),
    ]).catch(err => console.error("Failed to load settings data:", err))
  }, [])

  const copyKey = () => {
    if (!tenant) return
    navigator.clipboard.writeText(tenant.api_key)
    setCopied(true)
    toast.success('API key copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwdForm.current || !pwdForm.new || !pwdForm.confirm) {
      toast.error('All password fields are required')
      return
    }
    if (pwdForm.new !== pwdForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (pwdForm.new.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    setPwdLoading(true)
    try {
      await authAPI.changePassword({
        current_password: pwdForm.current,
        new_password: pwdForm.new,
      })
      toast.success('Password updated successfully!')
      setPwdForm({ current: '', new: '', confirm: '' })
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update password'
      toast.error(msg)
    } finally {
      setPwdLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--dash-input-bg)',
    border: '1.5px solid var(--dash-input-border)',
    borderRadius: 10,
    padding: '10px 14px',
    color: 'var(--color-cream)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        maxWidth: 1120, display: 'flex', flexDirection: 'column', gap: 28,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <PageHeader
          title="Settings"
          subtitle="Manage your account and preferences."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 28,
          alignItems: 'flex-start',
          width: '100%',
        }}>
          {/* Left Column: Profile, API Keys, Security (Change Password) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
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

              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px 16px', alignItems: 'center' }}>
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
            {canViewApiKey && (
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
            )}

            {/* Change Password Section */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={18} color="#fb923c" strokeWidth={2} />
                <h2 style={{
                  margin: 0, fontSize: 16, fontWeight: 700,
                  color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
                }}>Security</h2>
              </div>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>Current Password</label>
                  <input
                    type="password"
                    name="current"
                    value={pwdForm.current}
                    onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={pwdForm.new}
                      onChange={e => setPwdForm(f => ({ ...f, new: e.target.value }))}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>Confirm Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={pwdForm.confirm}
                      onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  style={{
                    background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    cursor: pwdLoading ? 'wait' : 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '10px 20px',
                    alignSelf: 'flex-start',
                    marginTop: 6,
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                  }}
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </Card>

          </div>

          {/* Right Column: Appearance, Coming soon sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* Plan & Billing Section */}
            {canViewBilling && usage && (
              <Card style={{
                display: 'flex', flexDirection: 'column', gap: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={18} color="#fb923c" strokeWidth={2} />
                  <h2 style={{
                    margin: 0, fontSize: 16, fontWeight: 700,
                    color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
                  }}>Plan & Billing</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{
                      margin: 0, fontSize: 14, color: 'var(--color-cream)', fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                    }}>Current Plan</p>
                    <p style={{
                      margin: '2px 0 0', fontSize: 13, color: 'var(--color-muted)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      You are currently on the <strong style={{ color: '#fb923c', textTransform: 'capitalize' }}>{usage.plan}</strong> plan
                    </p>
                  </div>
                  <Badge variant={usage.plan === 'free' ? 'warning' : 'default'} style={{ textTransform: 'uppercase' }}>
                    {usage.plan}
                  </Badge>
                </div>

                {usage.plan === 'free' && usage.trial_days_remaining !== null && (
                  <div style={{
                    background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
                    borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fbbf24',
                    fontFamily: 'var(--font-body)',
                  }}>
                    Your trial ends on <strong>{usage.trial_ends_at ? new Date(usage.trial_ends_at).toLocaleDateString() : '—'}</strong> ({usage.trial_days_remaining} days left).
                  </div>
                )}

                <div style={{ height: 1, background: 'var(--dash-card-border)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)' }}>Usage limits</h3>
                  
                  <ProgressBar
                    label="Chatbots"
                    current={usage.usage.chatbots}
                    limit={usage.limits.chatbots}
                  />

                  <ProgressBar
                    label="Conversations (per month)"
                    current={usage.usage.conversations}
                    limit={usage.limits.conversations}
                  />

                  <ProgressBar
                    label="Messages (per month)"
                    current={usage.usage.messages}
                    limit={usage.limits.messages}
                  />
                </div>

                <button
                  onClick={() => toast('Upgrade system is currently in preview. Integration with Stripe is coming soon!', { icon: '💳' })}
                  style={{
                    background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '10px 20px',
                    alignSelf: 'flex-start',
                    marginTop: 6,
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                  }}
                >
                  Upgrade Plan
                </button>
              </Card>
            )}
            
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
              { icon: Shield, label: 'Security (2FA)', desc: 'Two-factor authentication and session management.' },
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
        </div>
      </div>
    </DashboardLayout>
  )
}

function ProgressBar({ label, current, limit }: { label: string, current: number, limit: number }) {
  const percent = limit > 0 ? Math.min(100, (current / limit) * 100) : 0
  const isHigh = percent >= 80
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-body)' }}>
        <span style={{ color: 'var(--color-muted)' }}>{label}</span>
        <span style={{ color: 'var(--color-cream)', fontWeight: 600 }}>
          {current} / {limit >= 999999 ? '∞' : limit}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--dash-card-border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: isHigh
            ? 'linear-gradient(90deg, #ef4444, #f87171)'
            : 'linear-gradient(90deg, #ea580c, #fb923c)',
          borderRadius: 3,
          transition: 'width 0.4s ease-out'
        }} />
      </div>
    </div>
  )
}
