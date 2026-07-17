// src/pages/dashboard/DashboardLayout.tsx
import { useState,useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { authAPI } from '../../api/auth'
import {
  LayoutDashboard, Bot, BarChart3, Settings,
  LogOut, Sun, Moon, PanelLeftClose, PanelLeft, BookOpen,
  Building2, Users, Shield, Menu, X
} from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',  href: '/dashboard' },
  { icon: Bot,             label: 'Chatbots',  href: '/dashboard/chatbots' },
  { icon: BarChart3,       label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Users,           label: 'Team',      href: '/dashboard/team', roles: ['owner', 'admin'] },
  { icon: Settings,        label: 'Settings',  href: '/dashboard/settings' },
  { icon: BookOpen,        label: 'Docs',      href: '/docs' },
]

const ADMIN_NAV = [
  { icon: Building2, label: 'Tenants', href: '/dashboard/admin/tenants' },
  { icon: Users,     label: 'Users',   href: '/dashboard/admin/users' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const isSuperadmin = user?.is_superadmin ?? false
  const [collapsed, setCollapsed] = useState(false)
  const [isHeaderHovered, setIsHeaderHovered] = useState(false)
  const [usage, setUsage] = useState<any | null>(null)
  
  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sync user profile on mount to handle DB updates immediately
  useEffect(() => {
    authAPI.getMe()
      .then(res => {
        if (JSON.stringify(res) !== JSON.stringify(user)) {
          setUser(res)
        }
      })
      .catch(() => {})

    authAPI.getTenantUsage()
      .then(res => setUsage(res))
      .catch(() => {})
  }, [])

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const dark = theme === 'dark'
  
  // On mobile, sidebar is never "collapsed" icon-only, it's either fully open or completely hidden.
  const effectiveCollapsed = isMobile ? false : collapsed
  const sidebarWidth = effectiveCollapsed ? 64 : (isMobile ? 280 : 240)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close sidebar on mobile when navigating
  const onNavClick = () => {
    if (isMobile) setMobileOpen(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--dash-bg)', maxWidth: '100vw', overflowX: 'hidden' }}>

      {/* ── Mobile Overlay Backdrop ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* ── Sidebar (Fixed Position to avoid layout displacement) ── */}
      <aside style={{
        width:      sidebarWidth,
        flexShrink: 0,
        background: 'var(--dash-sidebar)',
        borderRight: '1px solid var(--dash-card-border)',
        display:    'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position:   'fixed',
        left:       isMobile ? (mobileOpen ? 0 : -sidebarWidth) : 0,
        top:        0,
        bottom:     0,
        zIndex:     1000,
        boxSizing:  'border-box',
      }}>

        {/* Logo + collapse toggle */}
        <div
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
          style={{
            padding:      '20px 16px',
            borderBottom: '1px solid var(--dash-card-border)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: effectiveCollapsed ? 'center' : 'space-between',
            gap:          10,
            position:     'relative',
            height:       73,
            boxSizing:    'border-box',
          }}
        >
          {/* If NOT collapsed, show logo and close button normally */}
          {!effectiveCollapsed && (
            <>
              <Link to="/dashboard" onClick={onNavClick} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                textDecoration: 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                  boxShadow: '0 0 16px rgba(234,88,12,0.4)',
                }}>✦</div>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: 18, color: 'var(--color-cream)', whiteSpace: 'nowrap',
                }}>Botify</span>
              </Link>
              {isMobile ? (
                <button onClick={() => setMobileOpen(false)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-muted)', display: 'flex', padding: 4,
                }}>
                  <X size={20} />
                </button>
              ) : (
                <button onClick={() => setCollapsed(true)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-muted)', display: 'flex', padding: 4,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-cream)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
                >
                  <PanelLeftClose size={18} />
                </button>
              )}
            </>
          )}

          {/* If collapsed, show logo or open button on hover */}
          {effectiveCollapsed && (
            isHeaderHovered ? (
              <button
                onClick={() => {
                  setCollapsed(false)
                  setIsHeaderHovered(false)
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-cream)', display: 'flex', padding: 8,
                  alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6,
                  backgroundColor: 'var(--dash-card-hover)',
                  transition: 'all 0.18s ease',
                }}
              >
                <PanelLeft size={18} />
              </button>
            ) : (
              <Link to="/dashboard" onClick={onNavClick} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                  boxShadow: '0 0 16px rgba(234,88,12,0.4)',
                }}>✦</div>
              </Link>
            )
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.filter((item: any) => {
            if (!item.roles) return true  // no role restriction
            return isSuperadmin || item.roles.includes(user?.role)
          }).map((item) => {
            const active = item.href === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavClick}
                title={effectiveCollapsed ? item.label : undefined}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        10,
                  padding:    effectiveCollapsed ? '10px 0' : '10px 12px',
                  justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color:      active ? 'var(--color-cream)' : 'var(--color-muted)',
                  background: active ? 'var(--dash-active-nav-bg)' : 'transparent',
                  border:     active ? '1px solid var(--dash-active-nav-border)' : '1px solid transparent',
                  transition: 'all var(--duration-fast) var(--ease-smooth)',
                  whiteSpace: 'nowrap',
                  overflow:   'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--dash-card-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                {!effectiveCollapsed && (
                  <span style={{
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    fontFamily: 'var(--font-body)',
                  }}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}

          {/* ── Superadmin section ── */}
          {isSuperadmin && (
            <>
              {/* Divider */}
              <div style={{
                height: 1,
                background: 'var(--dash-card-border)',
                margin: effectiveCollapsed ? '8px 8px' : '8px 12px',
              }} />
              {!effectiveCollapsed && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px 6px',
                }}>
                  <Shield size={11} color="#a855f7" strokeWidth={2.5} />
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    color: '#a855f7', fontFamily: 'var(--font-body)',
                    textTransform: 'uppercase',
                  }}>Platform</span>
                </div>
              )}
              {ADMIN_NAV.map((item) => {
                const active = location.pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNavClick}
                    title={effectiveCollapsed ? item.label : undefined}
                    style={{
                      display:    'flex',
                      alignItems: 'center',
                      gap:        10,
                      padding:    effectiveCollapsed ? '10px 0' : '10px 12px',
                      justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                      color:      active ? '#9637fbff' : '#a78bfa',
                      background: active ? 'rgba(168,85,247,0.12)' : 'transparent',
                      border:     active ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
                      transition: 'all var(--duration-fast) var(--ease-smooth)',
                      whiteSpace: 'nowrap',
                      overflow:   'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                    {!effectiveCollapsed && (
                      <span style={{
                        fontSize: 14, fontWeight: active ? 600 : 400,
                        fontFamily: 'var(--font-body)',
                      }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Bottom section: theme toggle + user + logout */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid var(--dash-card-border)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: '100%', padding: effectiveCollapsed ? '9px 0' : '9px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
              background: 'transparent', border: 'none',
              color: 'var(--color-muted)',
              fontSize: 13, cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
              transition: 'all var(--duration-fast) var(--ease-smooth)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--dash-card-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {dark
              ? <Sun size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              : <Moon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            }
            {!effectiveCollapsed && (dark ? 'Light mode' : 'Dark mode')}
          </button>

          {/* User info */}
          {!effectiveCollapsed && user && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--dash-card-hover)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{
                  margin: 0, fontSize: 13, fontWeight: 600,
                  color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1,
                }}>{user.full_name}</p>
                {isSuperadmin && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                    color: '#a855f7',
                    background: 'rgba(168,85,247,0.12)',
                    border: '1px solid rgba(168,85,247,0.2)',
                    borderRadius: 4, padding: '2px 5px',
                    lineHeight: 1, flexShrink: 0,
                  }}>SUPER</span>
                )}
              </div>
              <p style={{
                margin: '2px 0 0', fontSize: 11,
                color: 'var(--color-subtle)', fontFamily: 'var(--font-body)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{user.email}</p>
            </div>
          )}

          {/* Plan badge */}
          {!effectiveCollapsed && usage && (
            <div style={{
              padding: '6px 12px 10px',
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              color: 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>Plan: <strong style={{ color: '#fb923c', textTransform: 'capitalize' }}>{usage.plan}</strong></span>
              {usage.plan === 'free' && usage.trial_days_remaining !== null && (
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{usage.trial_days_remaining}d left</span>
              )}
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} title="Sign out" style={{
            width: '100%', padding: effectiveCollapsed ? '9px 0' : '9px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
            background: 'transparent', border: 'none',
            color: 'var(--color-subtle)',
            fontSize: 13, cursor: 'pointer',
            borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
            transition: 'color var(--duration-fast) var(--ease-smooth)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtle)')}
          >
            <LogOut size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {!effectiveCollapsed && 'Sign out'}
          </button>
        </div>

      </aside>

      {/* ── Main content (Offsets the fixed sidebar width) ── */}
      <main style={{
        flex: 1,
        minWidth: 0,
        minHeight: '100vh',
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.25s ease',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Mobile Header */}
        {isMobile && (
          <header style={{
            height: 60,
            borderBottom: '1px solid var(--dash-card-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 16,
            background: 'var(--dash-bg)',
            position: 'sticky',
            top: 0,
            zIndex: 900,
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--color-cream)',
                padding: 4, cursor: 'pointer', display: 'flex'
              }}
            >
              <Menu size={24} />
            </button>
            <Link to="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #ea580c, #fb923c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: '#fff',
                boxShadow: '0 0 12px rgba(234,88,12,0.4)',
              }}>✦</div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, color: 'var(--color-cream)',
              }}>Botify</span>
            </Link>
          </header>
        )}
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </main>

    </div>
  )
}