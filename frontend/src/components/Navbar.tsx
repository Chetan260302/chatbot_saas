// ============================================================
// Navbar — sticky, blurs on scroll, active link highlight
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { NAV_LINKS } from '../data/content'

interface NavbarProps {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export default function Navbar({
  theme,
  toggleTheme,
}: NavbarProps) {

  const isDark = theme === 'dark'
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isLoggedIn, logout } = useAuthStore()

  return (
    <nav style={{
      position: 'fixed',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 'min(1200px, calc(100% - 32px))',
      borderRadius: 9999,
      background: isDark
        ? 'rgba(12,10,9,0.75)'
        : 'rgba(255,251,245,0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: isDark
        ? '1px solid rgba(251,146,60,0.12)'
        : '1px solid rgba(180,83,9,0.15)',
      boxShadow: isDark
        ? '0 8px 32px rgba(0,0,0,0.4)'
        : '0 8px 32px rgba(120,53,15,0.08)',
    }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff',
            boxShadow: '0 0 16px rgba(234,88,12,0.5)',
          }}
        >
          ✦
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            color: isDark ? '#fff7ed' : '#1c1917',
            letterSpacing: '-0.3px',
          }}
        >
          Botify
        </span>
      </Link>

      {/* Desktop nav links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(20px, 2vw, 48px)',
        }}
        className="nav-links-desktop"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              color: isDark ? '#a8826a' : '#57534e',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = '#fb923c')
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = isDark ? '#a8826a' : '#57534e')
            }
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right side — CTA buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => toggleTheme()}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.05)',
            color: isDark ? '#fb923c' : '#ea580c',
            backdropFilter: 'blur(12px)',
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {isLoggedIn ? (
          <>
            <Link
              to="/dashboard"
              style={{
                color: isDark ? '#fb923c' : '#ea580c',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                logout()
                window.location.href = '/'
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.2s ease',
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: isDark ? '#a8826a' : '#57534e',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = '#fb923c')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = isDark ? '#a8826a' : '#57534e')
              }
            >
              Sign in
            </Link>

            <Link
              to="/register"
              style={{
                background: '#ea580c',
                color: '#fff7ed',
                padding: '8px 20px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                boxShadow: isDark
                  ? '0 0 20px rgba(234,88,12,0.35)'
                  : '0 0 16px rgba(180,83,9,0.30)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                const el = e.target as HTMLElement
                el.style.background = '#c2410c'
                el.style.boxShadow = '0 0 28px rgba(234,88,12,0.55)'
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                const el = e.target as HTMLElement
                el.style.background = '#ea580c'
                el.style.boxShadow = '0 0 20px rgba(234,88,12,0.35)'
                el.style.transform = 'translateY(0)'
              }}
            >
              Start free →
            </Link>
          </>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: isDark ? '#fff7ed' : '#1c1917',
            fontSize: 22,
            cursor: 'pointer',
            padding: 4,
          }}
          className="hamburger"
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            background: isDark
              ? 'rgba(12,10,9,0.92)'
              : 'rgba(255,247,237,0.92)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--dash-card-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            zIndex: 199,
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: isDark ? '#fff7ed' : '#1c1917',
                fontSize: 18,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
              }}
            >
              {link.label}
            </a>
          ))}

          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                style={{
                  color: isDark ? '#fff7ed' : '#1c1917',
                  fontSize: 18,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  logout()
                  window.location.href = '/'
                }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 9999,
                  fontSize: 16,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  color: isDark ? '#fff7ed' : '#1c1917',
                  fontSize: 18,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                style={{
                  background: '#ea580c',
                  color: '#fff7ed',
                  padding: '12px 24px',
                  borderRadius: 9999,
                  fontSize: 16,
                  fontWeight: 700,
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Start free →
              </Link>
            </>
          )}
        </div>
      )}

      {/* Responsive CSS injected inline */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  )
}