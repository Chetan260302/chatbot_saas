// src/pages/dashboard/OverviewPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatbotsApi, documentsApi, type Chatbot } from '../../api/chatbots'
import { authAPI, type TenantUsage } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import {
  Bot, Zap, FileText, Plus, ArrowRight,
  MessageSquare, BarChart3, Settings, ShieldAlert,
  Activity, ArrowUpRight, Circle,
  BookOpen,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'

interface BotHealth {
  id: string
  name: string
  slug: string
  isActive: boolean
  messageCount: number
  tokenCount: number
  docCount: number
  createdAt: string
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [usage, setUsage] = useState<TenantUsage | null>(null)
  const [botHealth, setBotHealth] = useState<BotHealth[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    Promise.all([
      chatbotsApi.list()
        .then(async (res) => {
          const bots = res.data
          setChatbots(bots)

          // Fetch stats and documents count for all bots in parallel
          try {
            const statsPromises = bots.map(b => chatbotsApi.stats(b.id).catch(() => ({ data: { total_messages: 0, total_tokens: 0 } })))
            const docsPromises = bots.map(b => documentsApi.list(b.id).catch(() => ({ data: [] })))

            const statsResults = await Promise.all(statsPromises)
            const docsResults = await Promise.all(docsPromises)

            const msgSum = statsResults.reduce((sum, current) => sum + (current.data?.total_messages || 0), 0)
            const tokSum = statsResults.reduce((sum, current) => sum + (current.data?.total_tokens || 0), 0)
            const docsSum = docsResults.reduce((sum, current) => sum + (current.data?.length || 0), 0)

            setTotalMessages(msgSum)
            setTotalTokens(tokSum)
            setTotalDocs(docsSum)

            // Build per-bot health data
            const healthData: BotHealth[] = bots.map((bot, i) => ({
              id: bot.id,
              name: bot.name,
              slug: bot.slug || bot.id,
              isActive: bot.is_active,
              messageCount: statsResults[i]?.data?.total_messages || 0,
              tokenCount: statsResults[i]?.data?.total_tokens || 0,
              docCount: docsResults[i]?.data?.length || 0,
              createdAt: bot.created_at,
            }))
            setBotHealth(healthData)
          } catch (err) {
            console.error('Error fetching dashboard sub-resources:', err)
          }
        })
        .catch((err) => {
          setError(err.response?.data?.detail || 'Failed to fetch dashboard data')
        }),
      authAPI.getTenantUsage()
        .then(res => setUsage(res))
        .catch(err => console.error('Failed to load usage summary:', err))
    ]).finally(() => {
      setLoading(false)
    })
  }, [])

  function formatTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    let interval = Math.floor(seconds / 31536000)
    if (interval >= 1) return `${interval}y ago`
    interval = Math.floor(seconds / 2592000)
    if (interval >= 1) return `${interval}mo ago`
    interval = Math.floor(seconds / 86400)
    if (interval >= 1) return `${interval}d ago`
    interval = Math.floor(seconds / 3600)
    if (interval >= 1) return `${interval}h ago`
    interval = Math.floor(seconds / 60)
    if (interval >= 1) return `${interval}m ago`
    return 'Just now'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const activeBots = chatbots.filter(b => b.is_active).length

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        minHeight: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}>
        {/* Header */}
        <PageHeader
          title={`${getGreeting()}, ${firstName} 👋`}
          subtitle="Here's your operator command center — all bots at a glance."
        />

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <StatCard
            icon={Bot}
            label="Total Chatbots"
            value={loading ? '...' : chatbots.length}
            iconColor="#fb923c"
            iconBg="rgba(234, 88, 12, 0.1)"
          />
          <StatCard
            icon={Activity}
            label="Active Bots"
            value={loading ? '...' : activeBots}
            iconColor="#4ade80"
            iconBg="rgba(34, 197, 94, 0.1)"
          />
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={loading ? '...' : totalMessages.toLocaleString()}
            iconColor="#60a5fa"
            iconBg="rgba(59, 130, 246, 0.1)"
          />
          <StatCard
            icon={FileText}
            label="Knowledge Files"
            value={loading ? '...' : totalDocs}
            iconColor="#a855f7"
            iconBg="rgba(168, 85, 247, 0.1)"
          />
        </div>

        {/* Main Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.6fr)',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Left: Chatbot Health Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{
                margin: 0,
                fontSize: 'var(--text-lg)',
                color: 'var(--color-cream)',
                fontFamily: 'var(--font-display)',
              }}>Chatbot Health</h2>
              <button
                onClick={() => navigate('/dashboard/chatbots')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#fb923c', fontSize: 'var(--text-xs)', fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                View all <ArrowUpRight size={12} />
              </button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <div style={{
                    width: 24, height: 24,
                    border: '2px solid var(--dash-card-border)', borderTopColor: '#fb923c',
                    borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
                  }} />
                </div>
              ) : error ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', padding: '24px' }}>
                  <ShieldAlert size={16} /> {error}
                </div>
              ) : botHealth.length === 0 ? (
                <div style={{
                  padding: '48px 24px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                  <Bot size={32} color="var(--color-muted)" strokeWidth={1.2} />
                  <p style={{
                    margin: 0, color: 'var(--color-muted)',
                    fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                  }}>No chatbots yet. Create your first one!</p>
                  <button
                    onClick={() => navigate('/dashboard/chatbots/new')}
                    style={{
                      background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '8px 20px', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Create Chatbot
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--dash-card-border)' }}>
                        {['Bot', 'Status', 'Messages', 'Docs', 'Created'].map(h => (
                          <th key={h} style={{
                            padding: '12px 16px', textAlign: 'left',
                            fontSize: 'var(--text-xs)', fontWeight: 600,
                            color: 'var(--color-muted)', textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {botHealth.map((bot, i) => (
                        <tr
                          key={bot.id}
                          onClick={() => navigate(`/dashboard/chatbots/${bot.slug}`)}
                          style={{
                            cursor: 'pointer',
                            borderBottom: i < botHealth.length - 1 ? '1px solid var(--dash-card-border)' : 'none',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--dash-card-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'rgba(234,88,12,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <Bot size={16} color="#fb923c" />
                              </div>
                              <span style={{
                                fontWeight: 600, color: 'var(--color-cream)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{bot.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '3px 10px', borderRadius: 9999,
                              fontSize: 11, fontWeight: 600,
                              background: bot.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: bot.isActive ? '#4ade80' : '#f87171',
                              border: `1px solid ${bot.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            }}>
                              <Circle size={6} fill="currentColor" />
                              {bot.isActive ? 'Active' : 'Paused'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-cream)', fontVariantNumeric: 'tabular-nums' }}>
                            {bot.messageCount.toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-cream)', fontVariantNumeric: 'tabular-nums' }}>
                            {bot.docCount}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-muted)', fontSize: 'var(--text-xs)' }}>
                            {(() => {
                              const d = new Date(bot.createdAt)
                              return isNaN(d.getTime()) ? '—' : formatTimeAgo(d)
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Right: Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              color: 'var(--color-cream)',
              fontFamily: 'var(--font-display)',
            }}>Quick Actions</h2>

            <Card style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard/chatbots/new')}
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s',
                  boxShadow: '0 4px 16px rgba(234,88,12,0.2)',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Plus size={16} />
                  <span>Create Chatbot</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => navigate('/dashboard/chatbots')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--dash-card-border)',
                  color: 'var(--color-cream)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dash-card-border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bot size={16} color="#fb923c" />
                  <span>View Chatbots</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => navigate('/dashboard/analytics')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--dash-card-border)',
                  color: 'var(--color-cream)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dash-card-border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={16} color="#60a5fa" />
                  <span>View Analytics</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => navigate('/dashboard/settings')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--dash-card-border)',
                  color: 'var(--color-cream)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dash-card-border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={16} color="#a855f7" />
                  <span>Account Settings</span>
                </div>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => navigate('/docs')}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--dash-card-border)',
                  color: 'var(--color-cream)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(234, 88, 12, 0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dash-card-border)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={16} color="#14b8a6" />
                  <span>Documentation</span>
                </div>
                <ArrowRight size={14} />
              </button>
            </Card>

            {/* Plan Usage Card */}
            {usage && (
              <Card style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} color="#fb923c" />
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Plan Usage</span>
                  </div>
                  <Badge variant={usage.plan === 'free' ? 'warning' : 'default'} style={{ textTransform: 'uppercase' }}>
                    {usage.plan}
                  </Badge>
                </div>

                {usage.plan === 'free' && usage.trial_days_remaining !== null && (
                  <div style={{
                    background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)',
                    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fbbf24',
                    fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Circle size={8} fill="currentColor" />
                    <span>{usage.trial_days_remaining} days left in trial</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Chatbots Progress */}
                  <ProgressBar
                    label="Chatbots"
                    current={usage.usage.chatbots}
                    limit={usage.limits.chatbots}
                  />

                  {/* Conversations Progress */}
                  <ProgressBar
                    label="Conversations"
                    current={usage.usage.conversations}
                    limit={usage.limits.conversations}
                  />

                  {/* Messages Progress */}
                  <ProgressBar
                    label="Messages"
                    current={usage.usage.messages}
                    limit={usage.limits.messages}
                  />
                </div>

                {(usage.usage.conversations / usage.limits.conversations > 0.8 ||
                  usage.usage.messages / usage.limits.messages > 0.8 ||
                  usage.usage.chatbots / usage.limits.chatbots > 0.8) && (
                  <button
                    onClick={() => navigate('/dashboard/settings')}
                    style={{
                      marginTop: 6,
                      background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '8px 16px', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                      boxShadow: '0 4px 12px rgba(139,92,246,0.2)',
                    }}
                  >
                    Upgrade Plan
                  </button>
                )}
              </Card>
            )}

            {/* Token usage summary mini card */}
            <Card style={{ padding: '16px 20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
              }}>
                <Zap size={16} color="#fbbf24" />
                <span style={{
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                  color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Token Usage</span>
              </div>
              <div style={{
                fontSize: 28, fontWeight: 800, color: 'var(--color-cream)',
                fontFamily: 'var(--font-display)', lineHeight: 1,
              }}>
                {loading ? '...' : totalTokens.toLocaleString()}
              </div>
              <p style={{
                margin: '4px 0 0', fontSize: 'var(--text-xs)',
                color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
              }}>
                Total tokens consumed across all bots
              </p>
            </Card>
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