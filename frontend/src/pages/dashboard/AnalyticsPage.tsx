// src/pages/dashboard/AnalyticsPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../../api/chatbots'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import {
  BarChart3, MessageSquare, Zap, FileText,
  Bot, Circle, ShieldAlert, TrendingUp,
} from 'lucide-react'

interface PerChatbot {
  id: string
  name: string
  slug: string
  is_active: boolean
  message_count: number
  token_count: number
  document_count: number
  last_message_at: string | null
}

interface DayData {
  date: string
  count: number
}

interface AnalyticsData {
  total_chatbots: number
  active_chatbots: number
  total_messages: number
  total_tokens: number
  total_documents: number
  per_chatbot: PerChatbot[]
  messages_by_day: DayData[]
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState<'message_count' | 'token_count' | 'document_count'>('message_count')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    setLoading(true)
    analyticsApi.overview()
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedBots = data?.per_chatbot
    ? [...data.per_chatbot].sort((a, b) => {
        const diff = a[sortKey] - b[sortKey]
        return sortDir === 'asc' ? diff : -diff
      })
    : []

  const maxDayCount = data?.messages_by_day
    ? Math.max(...data.messages_by_day.map(d => d.count), 1)
    : 1

  const avgMessagesPerBot = data && data.total_chatbots > 0
    ? Math.round(data.total_messages / data.total_chatbots)
    : 0

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  function formatTimestamp(iso: string | null) {
    if (!iso) return '—'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '—'
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    if (diffH < 1) return 'Just now'
    if (diffH < 24) return `${diffH}h ago`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 30) return `${diffD}d ago`
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const SortIcon = ({ col }: { col: typeof sortKey }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3, fontSize: 10 }}>⇅</span>
    return <span style={{ fontSize: 10 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <PageHeader
          title="Analytics"
          subtitle="Track chatbot performance and usage metrics across all your bots."
        />

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={loading ? '...' : (data?.total_messages || 0).toLocaleString()}
            iconColor="#fb923c"
            iconBg="rgba(234,88,12,0.1)"
          />
          <StatCard
            icon={Zap}
            label="Total Tokens Used"
            value={loading ? '...' : (data?.total_tokens || 0).toLocaleString()}
            iconColor="#fbbf24"
            iconBg="rgba(251,191,36,0.1)"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Messages/Bot"
            value={loading ? '...' : avgMessagesPerBot.toLocaleString()}
            iconColor="#4ade80"
            iconBg="rgba(34,197,94,0.1)"
          />
          <StatCard
            icon={FileText}
            label="Total Documents"
            value={loading ? '...' : (data?.total_documents || 0).toLocaleString()}
            iconColor="#60a5fa"
            iconBg="rgba(59,130,246,0.1)"
          />
        </div>

        {error && (
          <Card style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fca5a5', padding: '16px 20px' }}>
            <ShieldAlert size={16} /> {error}
          </Card>
        )}

        {/* Messages by Day Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{
            margin: 0, fontSize: 'var(--text-lg)',
            color: 'var(--color-cream)', fontFamily: 'var(--font-display)',
          }}>Messages Over Time</h2>

          <Card style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 24, height: 24,
                  border: '2px solid var(--dash-card-border)', borderTopColor: '#fb923c',
                  borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
                }} />
              </div>
            ) : (
              <div>
                {/* Chart */}
                <div style={{
                  display: 'flex', alignItems: 'flex-end', gap: 6,
                  height: 180, width: '100%',
                }}>
                  {data?.messages_by_day.map((day) => {
                    const heightPct = maxDayCount > 0 ? (day.count / maxDayCount) * 100 : 0
                    return (
                      <div
                        key={day.date}
                        style={{
                          flex: 1, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 4, height: '100%',
                          justifyContent: 'flex-end',
                        }}
                        title={`${formatDate(day.date)}: ${day.count} messages`}
                      >
                        {/* Count label on top of bar */}
                        {day.count > 0 && (
                          <span style={{
                            fontSize: 9, fontWeight: 600,
                            color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
                            fontVariantNumeric: 'tabular-nums',
                          }}>{day.count}</span>
                        )}
                        {/* Bar */}
                        <div style={{
                          width: '100%',
                          minHeight: day.count > 0 ? 4 : 2,
                          height: `${Math.max(heightPct, day.count > 0 ? 3 : 1)}%`,
                          background: day.count > 0
                            ? 'linear-gradient(to top, #ea580c, #fb923c)'
                            : 'var(--dash-card-border)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: day.count > 0 ? 1 : 0.4,
                        }} />
                      </div>
                    )
                  })}
                </div>
                {/* X-axis labels */}
                <div style={{
                  display: 'flex', gap: 6, marginTop: 8,
                  borderTop: '1px solid var(--dash-card-border)', paddingTop: 8,
                }}>
                  {data?.messages_by_day.map((day, i) => (
                    <div key={day.date} style={{
                      flex: 1, textAlign: 'center',
                      fontSize: 9, color: 'var(--color-muted)',
                      fontFamily: 'var(--font-body)',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                    }}>
                      {/* Show every other label to avoid crowding */}
                      {i % 2 === 0 ? formatDate(day.date) : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Per-chatbot Breakdown Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{
            margin: 0, fontSize: 'var(--text-lg)',
            color: 'var(--color-cream)', fontFamily: 'var(--font-display)',
          }}>Per-Chatbot Breakdown</h2>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 24, height: 24,
                  border: '2px solid var(--dash-card-border)', borderTopColor: '#fb923c',
                  borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
                }} />
              </div>
            ) : sortedBots.length === 0 ? (
              <div style={{
                padding: '48px 24px', textAlign: 'center',
                color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
              }}>
                <BarChart3 size={32} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No chatbot data yet. Create a chatbot to see analytics.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--dash-card-border)' }}>
                      <th style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: 'var(--color-muted)', textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Chatbot</th>
                      <th style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: 'var(--color-muted)', textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Status</th>
                      <th
                        onClick={() => handleSort('message_count')}
                        style={{
                          padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                          fontSize: 'var(--text-xs)', fontWeight: 600,
                          color: sortKey === 'message_count' ? '#fb923c' : 'var(--color-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          userSelect: 'none',
                        }}
                      >Messages <SortIcon col="message_count" /></th>
                      <th
                        onClick={() => handleSort('token_count')}
                        style={{
                          padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                          fontSize: 'var(--text-xs)', fontWeight: 600,
                          color: sortKey === 'token_count' ? '#fb923c' : 'var(--color-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          userSelect: 'none',
                        }}
                      >Tokens <SortIcon col="token_count" /></th>
                      <th
                        onClick={() => handleSort('document_count')}
                        style={{
                          padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                          fontSize: 'var(--text-xs)', fontWeight: 600,
                          color: sortKey === 'document_count' ? '#fb923c' : 'var(--color-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          userSelect: 'none',
                        }}
                      >Docs <SortIcon col="document_count" /></th>
                      <th style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: 'var(--color-muted)', textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBots.map((bot, i) => (
                      <tr
                        key={bot.id}
                        onClick={() => navigate(`/dashboard/chatbots/${bot.slug}`)}
                        style={{
                          cursor: 'pointer',
                          borderBottom: i < sortedBots.length - 1 ? '1px solid var(--dash-card-border)' : 'none',
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
                            background: bot.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: bot.is_active ? '#4ade80' : '#f87171',
                            border: `1px solid ${bot.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            <Circle size={6} fill="currentColor" />
                            {bot.is_active ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 16px', color: 'var(--color-cream)',
                          fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                        }}>
                          {bot.message_count.toLocaleString()}
                        </td>
                        <td style={{
                          padding: '12px 16px', color: 'var(--color-cream)',
                          fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                        }}>
                          {bot.token_count.toLocaleString()}
                        </td>
                        <td style={{
                          padding: '12px 16px', color: 'var(--color-cream)',
                          fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                        }}>
                          {bot.document_count}
                        </td>
                        <td style={{
                          padding: '12px 16px', color: 'var(--color-muted)',
                          fontSize: 'var(--text-xs)',
                        }}>
                          {formatTimestamp(bot.last_message_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
