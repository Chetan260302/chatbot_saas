// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI }      from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { AuthLayout, FormField, ErrorBanner, SubmitButton } from './components/AuthLayout'

export default function LoginPage() {
  const navigate   = useNavigate()
  const setAuth    = useAuthStore((s) => s.setAuth)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { theme }  = useThemeStore()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in? → dashboard
  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true })
  }, [isLoggedIn])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const tokens = await authAPI.login({
        email:    form.email,
        password: form.password,
      })
      // Save tokens to storage first so the getMe API request is authorized
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('access_token', tokens.access_token)
      storage.setItem('refresh_token', tokens.refresh_token)

      const user = await authAPI.getMe()
      setAuth(tokens.access_token, tokens.refresh_token, user, rememberMe)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const dark = theme === 'dark'
  const textColor = dark ? 'rgba(255,247,237,0.45)' : 'rgba(28,25,23,0.55)'

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Botify account"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          extra={
            <Link to="/forgot-password" style={{ fontSize: 12, color: '#fb923c', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          }
        />

        {/* Remember Me Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '-4px 0 4px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              cursor: 'pointer',
              accentColor: '#fb923c',
              width: 15,
              height: 15,
            }}
          />
          <label
            htmlFor="rememberMe"
            style={{
              fontSize: 13,
              color: 'var(--color-cream)',
              cursor: 'pointer',
              userSelect: 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            Remember me
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <SubmitButton loading={loading} label="Sign in →" />

        <p style={{
          textAlign: 'center', fontSize: 14,
          color: textColor,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          margin: '4px 0 0',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
            Start free
          </Link>
        </p>

      </form>
    </AuthLayout>
  )
}