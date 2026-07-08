// src/pages/components/AuthLayout.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'
import "../../styles/globals.css"

const palette = (dark: boolean) => ({
  bg:         dark ? '#0c0a09' : '#fafaf9',
  cardBg:     dark ? '#111009' : '#ffffff',
  cardBorder: dark ? 'rgba(41,37,36,0.8)' : 'rgba(214,211,209,0.8)',
  cardShadow: dark
    ? '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,146,60,0.06)'
    : '0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(214,211,209,0.4)',
  text:       dark ? '#fff7ed' : '#1c1917',
  textMuted:  dark ? 'rgba(255,247,237,0.45)' : 'rgba(28,25,23,0.55)',
  textSubtle: dark ? 'rgba(255,247,237,0.20)' : 'rgba(28,25,23,0.25)',
  inputBg:      dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  inputBgFocus: dark ? 'rgba(120,53,15,0.12)' : 'rgba(234,88,12,0.04)',
  inputBorder:  dark ? 'rgba(41,37,36,0.8)' : 'rgba(214,211,209,1)',
  inputFocus:   'rgba(234,88,12,0.55)',
  labelColor:   dark ? 'rgba(255,247,237,0.70)' : 'rgba(28,25,23,0.70)',
  glowBg:     dark
    ? 'radial-gradient(ellipse, rgba(120,53,15,0.22) 0%, transparent 70%)'
    : 'radial-gradient(ellipse, rgba(234,88,12,0.06) 0%, transparent 70%)',
})

interface AuthLayoutProps {
  title:    string
  subtitle: string
  children: React.ReactNode
  wide?:    boolean
}

export function AuthLayout({ title, subtitle, children, wide }: AuthLayoutProps) {
  const { theme } = useThemeStore()
  const dark = theme === 'dark'
  const c = palette(dark)

  return (
    <div style={{
      minHeight: '100vh',
      background: c.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: '-20%', left: '50%',
        transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: c.glowBg,
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        textDecoration: 'none', marginBottom: 32,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, color: '#fff',
          boxShadow: '0 0 20px rgba(234,88,12,0.5)',
        }}>✦</div>
        <span style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 800,
          fontSize: 22, color: c.text,
        }}>Botify</span>
      </Link>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: wide ? 520 : 440,
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: 20,
        padding: 'clamp(28px, 4vw, 40px)',
        boxShadow: c.cardShadow,
      }}>

        <h1 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900,
          fontSize: 'clamp(22px, 3vw, 28px)',
          color: c.text, margin: '0 0 8px',
          letterSpacing: '-0.5px',
        }}>
          {title}
        </h1>

        <p style={{
          fontSize: 14,
          color: c.textMuted,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          margin: '0 0 28px',
        }}>
          {subtitle}
        </p>

        {children}
      </div>

      {/* Bottom note */}
      <p style={{
        marginTop: 24, fontSize: 12,
        color: c.textSubtle,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        textAlign: 'center',
      }}>
        Protected by industry-standard encryption
      </p>

    </div>
  )
}

// ── Reusable form field ───────────────────────────────────────
interface FormFieldProps {
  label:        string
  name:         string
  type:         string
  placeholder:  string
  value:        string
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  extra?:       React.ReactNode
}

export function FormField({
  label, name, type, placeholder,
  value, onChange, autoComplete, extra,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false)
  const { theme } = useThemeStore()
  const dark = theme === 'dark'
  const c = palette(dark)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{
          fontSize: 13, fontWeight: 600,
          color: c.labelColor,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          {label}
        </label>
        {extra}
      </div>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={()  => setFocused(false)}
        required
        style={{
          width: '100%',
          padding: '12px 16px',
          background: focused ? c.inputBgFocus : c.inputBg,
          border: `1.5px solid ${focused ? c.inputFocus : c.inputBorder}`,
          borderRadius: 10,
          color: c.text,
          fontSize: 15,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: focused ? '0 0 0 3px rgba(234,88,12,0.10)' : 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── Error banner ──────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(239,68,68,0.10)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 8,
      color: '#fca5a5',
      fontSize: 13,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span>⚠</span> {message}
    </div>
  )
}

// ── Submit button ─────────────────────────────────────────────
export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '13px 24px',
        background: loading ? 'rgba(234,88,12,0.4)' : '#ea580c',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 800,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 8px 24px rgba(234,88,12,0.4)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {loading ? <Spinner /> : label}
    </button>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin-slow 0.7s linear infinite',
    }} />
  )
}