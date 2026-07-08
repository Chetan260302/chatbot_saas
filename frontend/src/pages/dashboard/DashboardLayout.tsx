// src/pages/dashboard/DashboardLayout.tsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import {
  LayoutDashboard, Bot, BarChart3, Settings,
  LogOut, Sun, Moon, PanelLeftClose, PanelLeft,
} from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',  href: '/dashboard' },
  { icon: Bot,             label: 'Chatbots',  href: '/dashboard/chatbots' },
  { icon: BarChart3,       label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings,        label: 'Settings',  href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [collapsed, setCollapsed] = useState(false)

  const dark = theme === 'dark'
  const sidebarWidth = collapsed ? 64 : 240

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--dash-bg)' }}>

      {/* ── Sidebar (Fixed Position to avoid layout displacement) ── */}
      <aside style={{
        width:      sidebarWidth,
        flexShrink: 0,
        background: 'var(--dash-sidebar)',
        borderRight: '1px solid var(--dash-card-border)',
        display:    'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        position:   'fixed',
        left:       0,
        top:        0,
        bottom:     0,
        zIndex:     100,
        boxSizing:  'border-box',
      }}>

        {/* Logo + collapse toggle */}
        <div style={{
          padding:      '20px 16px',
          borderBottom: '1px solid var(--dash-card-border)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap:          10,
        }}>
          <Link to="/dashboard" style={{
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
            {!collapsed && (
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 18, color: 'var(--color-cream)', whiteSpace: 'nowrap',
              }}>Botify</span>
            )}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted)', display: 'flex', padding: 4,
            }}>
              <PanelLeftClose size={18} />
            </button>
          )}
          {collapsed && (
            <button onClick={() => setCollapsed(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted)', display: 'flex', padding: 4,
              position: 'absolute', top: 20, left: 22,
            }}>
              <PanelLeft size={18} />
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => {
            const active = item.href === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        10,
                  padding:    collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
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
                {!collapsed && (
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
              width: '100%', padding: collapsed ? '9px 0' : '9px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
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
            {!collapsed && (dark ? 'Light mode' : 'Dark mode')}
          </button>

          {/* User info */}
          {!collapsed && user && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--dash-card-hover)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{
                margin: 0, fontSize: 13, fontWeight: 600,
                color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{user.full_name}</p>
              <p style={{
                margin: '2px 0 0', fontSize: 11,
                color: 'var(--color-subtle)', fontFamily: 'var(--font-body)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{user.email}</p>
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} title="Sign out" style={{
            width: '100%', padding: collapsed ? '9px 0' : '9px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
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
            {!collapsed && 'Sign out'}
          </button>
        </div>

      </aside>

      {/* ── Main content (Offsets the fixed sidebar width) ── */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.25s ease',
        boxSizing: 'border-box',
      }}>
        {children}
      </main>

    </div>
  )
}