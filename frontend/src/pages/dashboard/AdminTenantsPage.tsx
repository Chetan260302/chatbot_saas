// src/pages/dashboard/AdminTenantsPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type AdminTenant } from '../../api/admin'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Search, Building2, Bot, Users, ToggleLeft, ToggleRight,
  ShieldAlert, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminTenantsPage() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<AdminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchTenants = () => {
    setLoading(true)
    adminApi.listTenants(search || undefined)
      .then(res => setTenants(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load tenants'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchTenants(), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleToggle = async (tenantId: string, currentStatus: boolean) => {
    setToggling(tenantId)
    try {
      const res = await adminApi.toggleTenant(tenantId)
      setTenants(prev => prev.map(t =>
        t.id === tenantId ? { ...t, is_active: res.data.is_active } : t
      ))
      toast.success(`Tenant ${res.data.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to toggle tenant')
    } finally {
      setToggling(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return { bg: 'rgba(168,85,247,0.10)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' }
      case 'growth':     return { bg: 'rgba(59,130,246,0.10)', color: '#93c5fd', border: 'rgba(59,130,246,0.25)' }
      case 'starter':    return { bg: 'rgba(34,197,94,0.10)', color: '#86efac', border: 'rgba(34,197,94,0.25)' }
      default:           return { bg: 'rgba(255,255,255,0.04)', color: 'var(--color-muted)', border: 'var(--dash-card-border)' }
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
        gap: '24px',
      }}>
        <PageHeader
          title="Tenants"
          subtitle="Manage all businesses registered on your platform."
        />

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted)',
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants by name..."
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
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 28, height: 28,
              border: '2px solid var(--dash-card-border)', borderTopColor: '#a855f7',
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
        ) : tenants.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Building2 size={32} color="var(--color-muted)" strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
            <p style={{
              margin: 0, color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
            }}>
              {search ? 'No tenants match your search.' : 'No tenants registered yet.'}
            </p>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid var(--dash-card-border)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    {['Tenant', 'Plan', 'Chatbots', 'Users', 'Created', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--color-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant, i) => {
                    const planStyle = getPlanColor(tenant.plan)
                    return (
                      <tr
                        key={tenant.id}
                        style={{
                          borderBottom: i < tenants.length - 1 ? '1px solid var(--dash-card-border)' : 'none',
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => navigate(`/dashboard/chatbots?tenant_id=${tenant.id}`)}
                      >
                        {/* Name */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Building2 size={15} color="#a855f7" strokeWidth={1.8} />
                            </div>
                            <div>
                              <p style={{
                                margin: 0, fontWeight: 600, color: 'var(--color-cream)',
                                fontSize: 13,
                              }}>{tenant.name}</p>
                              <p style={{
                                margin: 0, fontSize: 11, color: 'var(--color-subtle)',
                              }}>{tenant.slug}</p>
                            </div>
                          </div>
                        </td>
                        {/* Plan */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: planStyle.color,
                            background: planStyle.bg,
                            border: `1px solid ${planStyle.border}`,
                            borderRadius: 6, padding: '3px 8px',
                            textTransform: 'capitalize',
                          }}>{tenant.plan}</span>
                        </td>
                        {/* Chatbots */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-muted)' }}>
                            <Bot size={13} /> {tenant.chatbot_count}
                          </span>
                        </td>
                        {/* Users */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-muted)' }}>
                            <Users size={13} /> {tenant.user_count}
                          </span>
                        </td>
                        {/* Created */}
                        <td style={{ padding: '14px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                          {tenant.created_at ? formatDate(tenant.created_at) : '—'}
                        </td>
                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          <Badge variant={tenant.is_active ? 'success' : 'secondary'}>
                            {tenant.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggle(tenant.id, tenant.is_active)}
                              disabled={toggling === tenant.id}
                              title={tenant.is_active ? 'Deactivate tenant' : 'Activate tenant'}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: tenant.is_active ? '#22c55e' : 'var(--color-muted)',
                                display: 'flex', padding: 4,
                                opacity: toggling === tenant.id ? 0.5 : 1,
                                transition: 'color 0.15s',
                              }}
                            >
                              {tenant.is_active
                                ? <ToggleRight size={20} />
                                : <ToggleLeft size={20} />
                              }
                            </button>
                            <button
                              onClick={() => navigate(`/dashboard/chatbots?tenant_id=${tenant.id}`)}
                              title="View chatbots"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#a78bfa', display: 'flex', padding: 4,
                              }}
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Summary footer */}
        {!loading && tenants.length > 0 && (
          <p style={{
            margin: 0, fontSize: 12, color: 'var(--color-subtle)',
            fontFamily: 'var(--font-body)',
          }}>
            Showing {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
            {' · '}
            {tenants.filter(t => t.is_active).length} active
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
