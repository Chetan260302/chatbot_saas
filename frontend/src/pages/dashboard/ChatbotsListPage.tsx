// src/pages/dashboard/ChatbotsListPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { chatbotsApi, documentsApi, type Chatbot } from '../../api/chatbots'
import { adminApi, type AdminTenant, type AdminChatbot } from '../../api/admin'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Search, Plus, ShieldAlert,
  Bot, FileText, MessageSquare, Edit2,
  Building2, ChevronDown, ToggleLeft, ToggleRight
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BotExtendedInfo {
  docCount: number
  messageCount: number
}

export default function ChatbotsListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const isSuperadmin = user?.is_superadmin ?? false

  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [adminChatbots, setAdminChatbots] = useState<AdminChatbot[]>([])
  const [extraInfo, setExtraInfo] = useState<Record<string, BotExtendedInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [tenantFilter, setTenantFilter] = useState(searchParams.get('tenant_id') || '')
  const [tenants, setTenants] = useState<AdminTenant[]>([])
  const [toggling, setToggling] = useState<string | null>(null)

  // Load tenants (superadmin only)
  useEffect(() => {
    if (isSuperadmin) {
      adminApi.listTenants().then(res => setTenants(res.data)).catch(() => {})
    }
  }, [isSuperadmin])

  // Fetch chatbots
  const fetchChatbots = () => {
    setLoading(true)
    if (isSuperadmin) {
      // Superadmin gets cross-tenant chatbots list from admin API
      adminApi.listAllChatbots({
        search: search || undefined,
        tenant_id: tenantFilter || undefined
      })
        .then((res) => {
          setAdminChatbots(res.data)
        })
        .catch((err) => {
          setError(err.response?.data?.detail || 'Failed to load platform chatbots')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      // Normal user list
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
    }
  }

  useEffect(() => {
    fetchChatbots()
  }, [isSuperadmin, tenantFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChatbots()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleToggle = async (chatbotId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setToggling(chatbotId)
    try {
      const res = await adminApi.toggleChatbot(chatbotId)
      setAdminChatbots(prev => prev.map(bot =>
        bot.id === chatbotId ? { ...bot, is_active: res.data.is_active } : bot
      ))
      toast.success(`Chatbot ${res.data.is_active ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to toggle chatbot')
    } finally {
      setToggling(null)
    }
  }

  const getDomainLabel = (domain?: string) => {
    const d = (domain || '').trim().toLowerCase()
    switch (d) {
      case 'education': return '🎓 Education'
      case 'ecommerce': return '🛒 E-commerce'
      case 'legal':     return '⚖️ Legal'
      case 'hr':        return '👥 HR'
      case 'general':
      default:          return '🌐 General'
    }
  }

  const normalFilteredBots = chatbots.filter(bot =>
    bot.name.toLowerCase().includes(search.toLowerCase())
  )

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
          title={isSuperadmin ? "Platform Chatbots" : "Chatbots"}
          subtitle={isSuperadmin ? "View and manage chatbots across all register tenants." : "Configure, train, and test your AI agents."}
          action={(
            <button
              onClick={() => navigate('/dashboard/chatbots/new')}
              style={{
                background: isSuperadmin 
                  ? 'linear-gradient(135deg, #a855f7, #c084fc)' 
                  : 'linear-gradient(135deg, #ea580c, #fb923c)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 22px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: isSuperadmin 
                  ? '0 4px 16px rgba(168,85,247,0.3)' 
                  : '0 4px 16px rgba(234,88,12,0.3)',
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
          )}
        />

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
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
              onFocus={(e) => (e.currentTarget.style.borderColor = isSuperadmin ? 'rgba(168,85,247,0.45)' : 'rgba(234,88,12,0.45)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
            />
          </div>

          {/* Tenant filter (superadmin only) */}
          {isSuperadmin && (
            <div style={{ position: 'relative' }}>
              <Building2 size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-muted)', pointerEvents: 'none',
              }} />
              <ChevronDown size={14} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-muted)', pointerEvents: 'none',
              }} />
              <select
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'var(--dash-input-bg)',
                  border: '1px solid var(--dash-input-border)',
                  borderRadius: '10px',
                  padding: '10px 32px 10px 34px',
                  color: 'var(--color-cream)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 180,
                }}
              >
                <option value="">All tenants</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 28, height: 28,
              border: '2px solid var(--dash-card-border)', borderTopColor: isSuperadmin ? '#a855f7' : '#fb923c',
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
        ) : (isSuperadmin ? adminChatbots.length === 0 : normalFilteredBots.length === 0) ? (
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
              background: isSuperadmin ? 'rgba(168,85,247,0.08)' : 'rgba(234,88,12,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={28} color={isSuperadmin ? '#a855f7' : '#fb923c'} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{
                margin: '0 0 6px',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-cream)',
                fontFamily: 'var(--font-display)',
              }}>
                No chatbots found
              </h3>
              <p style={{
                margin: 0,
                color: 'var(--color-muted)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
              }}>
                There are no chatbots matches the search query.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {/* RENDER SUPERADMIN CHATBOTS (Clickable if own tenant, oversight mode if other tenant) */}
            {isSuperadmin && adminChatbots.map((bot) => {
              const isOwnBot = bot.tenant_id && user?.tenant_id && 
                bot.tenant_id.toLowerCase().replace(/[^a-z0-9]/g, '') === user.tenant_id.toLowerCase().replace(/[^a-z0-9]/g, '')
              
              return (
                <Card
                  key={bot.id}
                  hoverable={isOwnBot}
                  onClick={isOwnBot ? () => navigate(`/dashboard/chatbots/${bot.slug || bot.id}`) : undefined}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    borderColor: isOwnBot ? 'var(--dash-card-border)' : 'rgba(168,85,247,0.15)',
                    cursor: isOwnBot ? 'pointer' : 'default',
                  }}
                >
                  {/* Top Row: Icon, Tenant name and Status toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: isOwnBot
                        ? 'linear-gradient(135deg, rgba(234,88,12,0.12), rgba(234,88,12,0.04))'
                        : 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Bot size={20} color={isOwnBot ? '#fb923c' : '#a855f7'} strokeWidth={1.8} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge variant={bot.is_active ? 'success' : 'secondary'}>
                        {bot.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <button
                        onClick={(e) => handleToggle(bot.id, e)}
                        disabled={toggling === bot.id}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: bot.is_active ? '#22c55e' : 'var(--color-muted)',
                          display: 'flex', padding: 2,
                          opacity: toggling === bot.id ? 0.5 : 1,
                        }}
                        title={bot.is_active ? 'Deactivate chatbot' : 'Activate chatbot'}
                      >
                        {bot.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
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
                      margin: '0 0 8px',
                      fontSize: 'var(--text-xs)',
                      color: isOwnBot ? 'rgba(234,88,12,0.7)' : 'rgba(168,85,247,0.7)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Building2 size={12} /> {bot.tenant_name} {isOwnBot ? '(Your Tenant)' : ''}
                    </p>
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
                      <FileText size={13} /> {bot.document_count} docs
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={13} /> {bot.message_count} messages
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
                    {isOwnBot ? (
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
                    ) : (
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-muted)',
                        fontFamily: 'var(--font-body)',
                        opacity: 0.6
                      }}>
                        Oversight Mode
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}

            {/* RENDER NORMAL USERS CHATBOTS (Clickable, redirects to edit details) */}
            {!isSuperadmin && normalFilteredBots.map((bot) => {
              const info = extraInfo[bot.id] || { docCount: 0, messageCount: 0 }
              return (
                <Card
                  key={bot.id}
                  hoverable
                  onClick={() => navigate(`/dashboard/chatbots/${bot.slug || bot.id}`)}
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
