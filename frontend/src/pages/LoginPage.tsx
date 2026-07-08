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
      // Set token first so the /me call is authorized
      localStorage.setItem('access_token', tokens.access_token)
      const user = await authAPI.getMe()
      setAuth(tokens.access_token, tokens.refresh_token, user)
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
            <a href="#" style={{ fontSize: 12, color: '#fb923c', textDecoration: 'none' }}>
              Forgot password?
            </a>
          }
        />

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