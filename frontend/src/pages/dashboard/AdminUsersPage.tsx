// src/pages/dashboard/AdminUsersPage.tsx
import { useEffect, useState } from 'react'
import { adminApi, type AdminUser, type AdminTenant } from '../../api/admin'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Search, Users, Shield, ToggleLeft, ToggleRight,
  ShieldAlert, Building2, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [tenants, setTenants] = useState<AdminTenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (tenantFilter) params.tenant_id = tenantFilter

    adminApi.listUsers(params)
      .then(res => setUsers(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load users'))
      .finally(() => setLoading(false))
  }

  // Load tenants for filter dropdown
  useEffect(() => {
    adminApi.listTenants().then(res => setTenants(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [tenantFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleToggle = async (userId: string) => {
    setToggling(userId)
    try {
      const res = await adminApi.toggleUser(userId)
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: res.data.is_active } : u
      ))
      toast.success(`User ${res.data.is_active ? 'activated' : 'deactivated'}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to toggle user')
    } finally {
      setToggling(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return { bg: 'rgba(234,88,12,0.10)', color: '#fb923c', border: 'rgba(234,88,12,0.25)' }
      case 'admin':
        return { bg: 'rgba(59,130,246,0.10)', color: '#93c5fd', border: 'rgba(59,130,246,0.25)' }
      default:
        return { bg: 'rgba(255,255,255,0.04)', color: 'var(--color-muted)', border: 'var(--dash-card-border)' }
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
          title="Users"
          subtitle="Search and manage users across all tenants."
        />

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: '320px', width: '100%' }}>
            <Search size={16} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-muted)',
            }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
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

          {/* Tenant filter */}
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
        ) : users.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Users size={32} color="var(--color-muted)" strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
            <p style={{
              margin: 0, color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
            }}>
              {search || tenantFilter ? 'No users match your filters.' : 'No users found.'}
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
                    {['User', 'Tenant', 'Role', 'Created', 'Status', 'Actions'].map(h => (
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
                  {users.map((user, i) => {
                    const roleStyle = getRoleBadge(user.role)
                    return (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: i < users.length - 1 ? '1px solid var(--dash-card-border)' : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* User */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: user.is_superadmin
                                ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.08))'
                                : 'linear-gradient(135deg, rgba(234,88,12,0.12), rgba(234,88,12,0.04))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 700,
                              color: user.is_superadmin ? '#c084fc' : '#fb923c',
                            }}>
                              {user.is_superadmin
                                ? <Shield size={14} />
                                : user.full_name.charAt(0).toUpperCase()
                              }
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <p style={{
                                  margin: 0, fontWeight: 600, color: 'var(--color-cream)',
                                  fontSize: 13,
                                }}>{user.full_name}</p>
                                {user.is_superadmin && (
                                  <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    color: '#a855f7',
                                    background: 'rgba(168,85,247,0.12)',
                                    border: '1px solid rgba(168,85,247,0.2)',
                                    borderRadius: 3, padding: '1px 4px',
                                    lineHeight: 1,
                                  }}>SUPER</span>
                                )}
                              </div>
                              <p style={{
                                margin: 0, fontSize: 11, color: 'var(--color-subtle)',
                              }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Tenant */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            color: 'var(--color-muted)', fontSize: 13,
                          }}>
                            <Building2 size={12} strokeWidth={1.5} />
                            {user.tenant_name}
                          </span>
                        </td>
                        {/* Role */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: roleStyle.color,
                            background: roleStyle.bg,
                            border: `1px solid ${roleStyle.border}`,
                            borderRadius: 6, padding: '3px 8px',
                            textTransform: 'capitalize',
                          }}>{user.role}</span>
                        </td>
                        {/* Created */}
                        <td style={{ padding: '14px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                          {user.created_at ? formatDate(user.created_at) : '—'}
                        </td>
                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          <Badge variant={user.is_active ? 'success' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '14px 16px' }}>
                          {!user.is_superadmin && (
                            <button
                              onClick={() => handleToggle(user.id)}
                              disabled={toggling === user.id}
                              title={user.is_active ? 'Disable user' : 'Enable user'}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: user.is_active ? '#22c55e' : 'var(--color-muted)',
                                display: 'flex', padding: 4,
                                opacity: toggling === user.id ? 0.5 : 1,
                                transition: 'color 0.15s',
                              }}
                            >
                              {user.is_active
                                ? <ToggleRight size={20} />
                                : <ToggleLeft size={20} />
                              }
                            </button>
                          )}
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
        {!loading && users.length > 0 && (
          <p style={{
            margin: 0, fontSize: 12, color: 'var(--color-subtle)',
            fontFamily: 'var(--font-body)',
          }}>
            Showing {users.length} user{users.length !== 1 ? 's' : ''}
            {' · '}
            {users.filter(u => u.is_active).length} active
            {users.filter(u => u.is_superadmin).length > 0 && (
              <> · {users.filter(u => u.is_superadmin).length} superadmin</>
            )}
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
