// src/pages/dashboard/ChatbotsListPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatbotsApi, documentsApi, type Chatbot } from '../../api/chatbots'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Search, Plus, ArrowRight, ShieldAlert,
  Bot, FileText, MessageSquare, Edit2,
} from 'lucide-react'

interface BotExtendedInfo {
  docCount: number
  messageCount: number
}

export default function ChatbotsListPage() {
  const navigate = useNavigate()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [extraInfo, setExtraInfo] = useState<Record<string, BotExtendedInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    chatbotsApi.list()
      .then(async (res) => {
        const bots = res.data
        setChatbots(bots)

        // Pre-fetch document & message counts for each chatbot
        const infoMap: Record<string, BotExtendedInfo> = {}
        const fetchDetailsPromises = bots.map(async (bot) => {
          try {
            const [statsRes, docsRes] = await Promise.all([
              chatbotsApi.stats(bot.id).catch(() => ({ data: { total_messages: 0 } })),
              documentsApi.list(bot.id).catch(() => ({ data: [] })),
            ])
            infoMap[bot.id] = {
              messageCount: statsRes.data?.total_messages || 0,
              docCount: docsRes.data?.length || 0,
            }
          } catch (e) {
            console.error('Failed to pre-fetch chatbot details:', e)
            infoMap[bot.id] = { docCount: 0, messageCount: 0 }
          }
        })

        await Promise.all(fetchDetailsPromises)
        setExtraInfo(infoMap)
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load chatbots')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredBots = chatbots.filter(bot =>
    bot.name.toLowerCase().includes(search.toLowerCase())
  )

  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case 'education': return '🎓 Education'
      case 'ecommerce': return '🛒 E-commerce'
      case 'legal':     return '⚖️ Legal'
      case 'hr':        return '👥 HR'
      case 'general':
      default:          return '🌐 General'
    }
  }

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
        {/* Page Header */}
        <PageHeader
          title="Chatbots"
          subtitle="Configure, train, and test your AI agents."
          action={
            <button
              onClick={() => navigate('/dashboard/chatbots/new')}
              style={{
                background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 22px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 16px rgba(234,88,12,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New chatbot</span>
            </button>
          }
        />

        {/* Search Input */}
        <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted)',
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chatbots by name..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--dash-input-bg)',
              border: '1px solid var(--dash-input-border)',
              borderRadius: '10px',
              padding: '10px 14px 10px 38px',
              color: 'var(--color-cream)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(234,88,12,0.45)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
          />
        </div>

        {/* Main Grid Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 28, height: 28,
              border: '2px solid var(--dash-card-border)', borderTopColor: '#fb923c',
              borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
            }} />
          </div>
        ) : error ? (
          <div style={{
            padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldAlert size={16} /> {error}
          </div>
        ) : filteredBots.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px dashed var(--dash-card-border)',
            borderRadius: '16px',
            padding: '56px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(234,88,12,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={28} color="#fb923c" strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{
                margin: '0 0 6px',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-cream)',
                fontFamily: 'var(--font-display)',
              }}>
                {search ? 'No chatbots match your search' : 'No chatbots yet'}
              </h3>
              <p style={{
                margin: 0,
                color: 'var(--color-muted)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
              }}>
                {search ? 'Try adjusting your search criteria.' : 'Get started by creating your first AI chatbot.'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => navigate('/dashboard/chatbots/new')}
                style={{
                  background: 'rgba(234,88,12,0.12)',
                  color: '#fb923c',
                  border: '1px solid rgba(234,88,12,0.25)',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={15} /> Create Chatbot
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {filteredBots.map((bot) => {
              const info = extraInfo[bot.id] || { docCount: 0, messageCount: 0 }
              return (
                <Card
                  key={bot.id}
                  hoverable
                  onClick={() => navigate(`/dashboard/chatbots/${bot.id}`)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {/* Top Row: Icon and Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(234,88,12,0.12), rgba(234,88,12,0.04))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Bot size={20} color="#fb923c" strokeWidth={1.8} />
                    </div>
                    <Badge variant={bot.is_active ? 'success' : 'secondary'}>
                      {bot.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Body Content */}
                  <div>
                    <h3 style={{
                      margin: '0 0 6px',
                      fontSize: 'var(--text-md)',
                      color: 'var(--color-cream)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                    }}>{bot.name}</h3>
                    <p style={{
                      margin: 0,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-muted)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {bot.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Mid Row: Info Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-muted)',
                    fontFamily: 'var(--font-body)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={13} /> {info.docCount} docs
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={13} /> {info.messageCount} messages
                    </span>
                  </div>

                  {/* Footer Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--dash-card-border)',
                  }}>
                    <Badge variant="secondary">
                      {getDomainLabel(bot.domain)}
                    </Badge>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: '#fb923c',
                      fontFamily: 'var(--font-body)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      Edit <Edit2 size={13} />
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
