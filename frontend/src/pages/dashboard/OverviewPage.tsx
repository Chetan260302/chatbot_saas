// src/pages/dashboard/OverviewPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatbotsApi, documentsApi, type Chatbot } from '../../api/chatbots'
import { authAPI } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Bot, Zap, FileText, CreditCard, Plus, ArrowRight,
  MessageSquare, BarChart3, Settings, ShieldAlert,
  Clock, PlusCircle, Globe, CheckCircle,
  BookOpen,
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'creation' | 'training' | 'system'
  title: string
  detail: string
  timestamp: string
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    setLoading(true)

    // Load actual tenant plan
    authAPI.getTenantMe()
      .then(res => setPlan(res.plan || 'free'))
      .catch(err => console.error("Failed to load tenant plan:", err))

    chatbotsApi.list()
      .then(async (res) => {
        const bots = res.data
        setChatbots(bots)

        // Generate dynamic activity items from the actual bots
        const generatedActivities: ActivityItem[] = []
        
        bots.forEach((bot, index) => {
          const date = new Date(bot.created_at)
          const timeString = isNaN(date.getTime()) ? `${index + 1} day(s) ago` : formatTimeAgo(date)
          
          generatedActivities.push({
            id: `bot-create-${bot.id}`,
            type: 'creation',
            title: `Created chatbot "${bot.name}"`,
            detail: `Setup complete with domain ${bot.domain.toUpperCase()}`,
            timestamp: timeString,
          })

          generatedActivities.push({
            id: `bot-train-${bot.id}`,
            type: 'training',
            title: `Configured system prompt for "${bot.name}"`,
            detail: bot.description || 'Smart default assistant prompts loaded.',
            timestamp: timeString,
          })
        })

        // Add a default system activity if feed is small
        generatedActivities.push({
          id: 'sys-init',
          type: 'system',
          title: 'System account initialized',
          detail: `Workspace activated for tenant.`,
          timestamp: 'Just now',
        })

        // Sort or slice to get last 5 short items
        setActivities(generatedActivities.slice(0, 5))

        // Fetch stats and documents count for all bots in parallel
        try {
          const statsPromises = bots.map(b => chatbotsApi.stats(b.id).catch(() => ({ data: { total_messages: 0 } })))
          const docsPromises = bots.map(b => documentsApi.list(b.id).catch(() => ({ data: [] })))

          const statsResults = await Promise.all(statsPromises)
          const docsResults = await Promise.all(docsPromises)

          const msgSum = statsResults.reduce((sum, current) => sum + (current.data?.total_messages || 0), 0)
          const docsSum = docsResults.reduce((sum, current) => sum + (current.data?.length || 0), 0)

          setTotalMessages(msgSum)
          setTotalDocs(docsSum)
        } catch (err) {
          console.error('Error fetching dashboard sub-resources:', err)
        }
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to fetch dashboard data')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Helper to format timestamps
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
          subtitle="Here is what's happening with your AI assistants today."
        />

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
            icon={MessageSquare}
            label="Total Messages"
            value={loading ? '...' : totalMessages}
            iconColor="#4ade80"
            iconBg="rgba(34, 197, 94, 0.1)"
          />
          <StatCard
            icon={FileText}
            label="Knowledge Files"
            value={loading ? '...' : totalDocs}
            iconColor="#60a5fa"
            iconBg="rgba(59, 130, 246, 0.1)"
          />
          <StatCard
            icon={CreditCard}
            label="Current Plan"
            value={loading ? '...' : plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan'}
            iconColor="#a855f7"
            iconBg="rgba(168, 85, 247, 0.1)"
          />
        </div>

        {/* Main Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: '24px',
          alignItems: 'start',
        }}>
          {/* Left: Recent Activity Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              color: 'var(--color-cream)',
              fontFamily: 'var(--font-display)',
            }}>Recent Activity</h2>

            <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: 24, height: 24,
                    border: '2px solid var(--dash-card-border)', borderTopColor: '#fb923c',
                    borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
                  }} />
                </div>
              ) : error ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5' }}>
                  <ShieldAlert size={16} /> {error}
                </div>
              ) : activities.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
                  No recent activity recorded.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid var(--dash-card-border)',
                      }}
                    >
                      <div style={{
                        marginTop: 2,
                        padding: 6,
                        borderRadius: 8,
                        background: act.type === 'creation' ? 'rgba(234,88,12,0.1)' : act.type === 'training' ? 'rgba(95,130,246,0.1)' : 'rgba(34,197,94,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {act.type === 'creation' ? (
                          <PlusCircle size={14} color="#fb923c" />
                        ) : act.type === 'training' ? (
                          <Globe size={14} color="#60a5fa" />
                        ) : (
                          <CheckCircle size={14} color="#4ade80" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-cream)',
                            fontFamily: 'var(--font-body)',
                          }}>{act.title}</span>
                          <span style={{
                            fontSize: '11px',
                            color: 'var(--color-muted)',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <Clock size={11} /> {act.timestamp}
                          </span>
                        </div>
                        <p style={{
                          margin: '2px 0 0',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-muted)',
                          fontFamily: 'var(--font-body)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{act.detail}</p>
                      </div>
                    </div>
                  ))}
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
                  <BookOpen size={16} color="#fb923c" />
                  <span>View Documentation</span>
                </div>
                <ArrowRight size={14} />
              </button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}