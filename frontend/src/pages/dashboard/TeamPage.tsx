// src/pages/dashboard/TeamPage.tsx
import { useEffect, useState } from 'react'
import { teamApi, type TeamMember } from '../../api/team'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Users, UserPlus, Shield, ShieldAlert,
  ChevronDown, Trash2, Mail, Calendar, Circle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_COLORS: Record<string, string> = {
  owner:  '#f59e0b',
  admin:  '#8b5cf6',
  member: '#64748b',
}

export default function TeamPage() {
  const { user } = useAuthStore()
  const { canManageTeam, canInviteMembers, canChangeRoles, isOwner } = usePermissions()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Invite form state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'member' })
  const [inviting, setInviting] = useState(false)

  // Changing role / removing
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await teamApi.listMembers()
      setMembers(res.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.email || !inviteForm.full_name) {
      toast.error('Email and full name are required')
      return
    }
    setInviting(true)
    try {
      await teamApi.inviteMember(inviteForm)
      toast.success(`Invited ${inviteForm.email} as ${inviteForm.role}`)
      setInviteForm({ email: '', full_name: '', role: 'member' })
      setShowInvite(false)
      fetchMembers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setChangingRole(memberId)
    try {
      await teamApi.changeMemberRole(memberId, newRole)
      toast.success('Role updated successfully')
      fetchMembers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to change role')
    } finally {
      setChangingRole(null)
    }
  }

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team? This action cannot be undone.`)) return
    setRemoving(memberId)
    try {
      await teamApi.removeMember(memberId)
      toast.success(`${memberName} removed from team`)
      fetchMembers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to remove member')
    } finally {
      setRemoving(null)
    }
  }

  if (!canManageTeam) {
    return (
      <DashboardLayout>
        <div style={{
          padding: 'clamp(24px, 3vw, 40px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', gap: 16,
        }}>
          <ShieldAlert size={48} color="var(--color-muted)" strokeWidth={1.2} />
          <h2 style={{
            margin: 0, color: 'var(--color-cream)',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
          }}>Access Restricted</h2>
          <p style={{
            margin: 0, color: 'var(--color-muted)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', textAlign: 'center',
          }}>
            Only owners and admins can manage the team. Contact your tenant owner to request access.
          </p>
        </div>
      </DashboardLayout>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--dash-input-bg)',
    border: '1.5px solid var(--dash-input-border)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'var(--color-cream)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <DashboardLayout>
      <style>{`
        .team-invite-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto auto;
          gap: 12px;
          align-items: end;
        }
        .team-role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 768px) {
          .team-invite-grid {
            grid-template-columns: 1fr;
            align-items: stretch;
          }
          .team-role-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div style={{
        padding: 'clamp(16px, 3vw, 40px)',
        minHeight: '100%', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: '28px',
        maxWidth: '100%', overflowX: 'hidden',
      }}>
        <PageHeader
          title="Team"
          subtitle="Manage your team members, roles, and invitations."
          action={canInviteMembers && (
            <button
              onClick={() => setShowInvite(!showInvite)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '10px 22px', fontSize: 'var(--text-sm)',
                fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <UserPlus size={16} strokeWidth={2.5} />
              <span>{showInvite ? 'Cancel' : 'Invite member'}</span>
            </button>
          )}
        />

        {/* Invite Form */}
        {showInvite && (
          <Card style={{
            borderColor: 'rgba(139,92,246,0.2)',
            background: 'rgba(139,92,246,0.03)',
          }}>
            <h3 style={{
              margin: '0 0 16px', fontSize: 'var(--text-md)',
              color: 'var(--color-cream)', fontFamily: 'var(--font-display)',
              fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Mail size={18} color="#a78bfa" /> Invite a team member
            </h3>
            <form onSubmit={handleInvite} className="team-invite-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Email *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="team@company.com"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Full name *</label>
                <input
                  type="text"
                  value={inviteForm.full_name}
                  onChange={e => setInviteForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Jane Doe"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Role</label>
                <div style={{ position: 'relative' }}>
                  <ChevronDown size={14} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-muted)', pointerEvents: 'none',
                  }} />
                  <select
                    value={inviteForm.role}
                    onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                    style={{
                      ...inputStyle, appearance: 'none', paddingRight: 30, cursor: 'pointer', minWidth: 120,
                    }}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={inviting} style={{
                background: inviting ? 'rgba(139,92,246,0.4)' : '#8b5cf6',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '10px 20px', fontSize: 'var(--text-sm)',
                fontWeight: 700, cursor: inviting ? 'wait' : 'pointer',
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
              }}>
                {inviting ? 'Inviting…' : 'Send invite'}
              </button>
            </form>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#fca5a5', padding: '14px 18px',
            background: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.2)',
          }}>
            <ShieldAlert size={16} /> {error}
          </Card>
        )}

        {/* Members Table */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <div style={{
                width: 28, height: 28,
                border: '2px solid var(--dash-card-border)', borderTopColor: '#8b5cf6',
                borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
              }} />
            </div>
          ) : members.length === 0 ? (
            <div style={{
              padding: '48px 24px', textAlign: 'center',
              color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
            }}>
              <Users size={32} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No team members yet. Invite someone to get started.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse',
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dash-card-border)' }}>
                    {['Member', 'Role', 'Status', 'Joined', ''].map(h => (
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
                  {members.map((m, i) => {
                    const isMe = m.id === user?.id
                    const isOwnerRow = m.role === 'owner'
                    const canChangeThisRole = canChangeRoles && !isOwnerRow && !isMe
                    const canRemoveThis =
                      (isOwner || (user?.role === 'admin' && m.role === 'member')) &&
                      !isOwnerRow && !isMe

                    return (
                      <tr key={m.id} style={{
                        borderBottom: i < members.length - 1 ? '1px solid var(--dash-card-border)' : 'none',
                      }}>
                        {/* Name & Email */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: `linear-gradient(135deg, ${ROLE_COLORS[m.role] || '#64748b'}22, ${ROLE_COLORS[m.role] || '#64748b'}08)`,
                              border: `1.5px solid ${ROLE_COLORS[m.role] || '#64748b'}33`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 700,
                              color: ROLE_COLORS[m.role] || '#64748b',
                            }}>
                              {m.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{
                                fontWeight: 600, color: 'var(--color-cream)',
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                {m.full_name}
                                {isMe && (
                                  <span style={{
                                    fontSize: 9, padding: '1px 6px', borderRadius: 4,
                                    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
                                    fontWeight: 600,
                                  }}>You</span>
                                )}
                              </div>
                              <div style={{
                                fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 2,
                              }}>{m.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 16px' }}>
                          {canChangeThisRole ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={m.role}
                                onChange={e => handleRoleChange(m.id, e.target.value)}
                                disabled={changingRole === m.id}
                                style={{
                                  appearance: 'none',
                                  background: 'var(--dash-input-bg)',
                                  border: '1px solid var(--dash-card-border)',
                                  borderRadius: 8,
                                  padding: '4px 26px 4px 10px',
                                  color: ROLE_COLORS[m.role] || 'var(--color-cream)',
                                  fontSize: 12, fontWeight: 600,
                                  cursor: changingRole === m.id ? 'wait' : 'pointer',
                                  outline: 'none',
                                  fontFamily: 'var(--font-body)',
                                  opacity: changingRole === m.id ? 0.5 : 1,
                                }}
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                              </select>
                              <ChevronDown size={11} style={{
                                position: 'absolute', right: 8, top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-muted)', pointerEvents: 'none',
                              }} />
                            </div>
                          ) : (
                            <Badge variant={m.role === 'owner' ? 'warning' : m.role === 'admin' ? 'default' : 'secondary'}>
                              <Shield size={10} style={{ marginRight: 4 }} />
                              {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                            </Badge>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '3px 10px', borderRadius: 9999,
                            fontSize: 11, fontWeight: 600,
                            background: m.is_active
                              ? (m.is_verified ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)')
                              : 'rgba(239,68,68,0.1)',
                            color: m.is_active
                              ? (m.is_verified ? '#4ade80' : '#fbbf24')
                              : '#f87171',
                            border: `1px solid ${m.is_active
                              ? (m.is_verified ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)')
                              : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            <Circle size={6} fill="currentColor" />
                            {!m.is_active ? 'Disabled' : !m.is_verified ? 'Pending' : 'Active'}
                          </span>
                        </td>

                        {/* Joined */}
                        <td style={{
                          padding: '14px 16px', color: 'var(--color-muted)',
                          fontSize: 'var(--text-xs)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Calendar size={12} />
                          {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px' }}>
                          {canRemoveThis && (
                            <button
                              onClick={() => handleRemove(m.id, m.full_name)}
                              disabled={removing === m.id}
                              style={{
                                background: 'none', border: 'none',
                                cursor: removing === m.id ? 'wait' : 'pointer',
                                color: '#f87171', padding: 4,
                                display: 'flex', alignItems: 'center',
                                opacity: removing === m.id ? 0.5 : 0.7,
                                transition: 'opacity 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                              onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                              title="Remove from team"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Role Legend */}
        <Card style={{ padding: '16px 20px' }}>
          <h4 style={{
            margin: '0 0 12px', fontSize: 13, fontWeight: 700,
            color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
          }}>Role permissions</h4>
          <div className="team-role-grid">
            {[
              { role: 'Owner', color: ROLE_COLORS.owner, perms: 'Full control — billing, API keys, delete tenant, manage all members' },
              { role: 'Admin', color: ROLE_COLORS.admin, perms: 'Create/edit chatbots, upload docs, invite members. No billing or API key access.' },
              { role: 'Member', color: ROLE_COLORS.member, perms: 'View chatbots & documents, use test chat. Read-only access.' },
            ].map(r => (
              <div key={r.role} style={{
                padding: '12px 14px', borderRadius: 10,
                background: `${r.color}06`,
                border: `1px solid ${r.color}15`,
              }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: r.color,
                  marginBottom: 4, fontFamily: 'var(--font-body)',
                }}>{r.role}</div>
                <div style={{
                  fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.5,
                  fontFamily: 'var(--font-body)',
                }}>{r.perms}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
