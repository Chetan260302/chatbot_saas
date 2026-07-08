// src/pages/ForgotPasswordPage.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI }      from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { toast } from 'react-hot-toast'
import { AuthLayout, FormField, ErrorBanner, SubmitButton } from './components/AuthLayout'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { theme }  = useThemeStore()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Already logged in? → dashboard
  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true })
  }, [isLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Email address is required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await authAPI.forgotPassword(email)
      setSuccess(true)
      toast.success('Password reset link generated!')
      
      // In development, helpfully print the link for easy testing!
      if (res.dev_reset_url) {
        console.log("DEV ONLY Reset URL:", res.dev_reset_url)
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  const dark = theme === 'dark'
  const textColor = dark ? 'rgba(255,247,237,0.45)' : 'rgba(28,25,23,0.55)'

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll help you reset it"
    >
      {success ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{
            color: 'var(--color-cream)', fontSize: 14, lineHeight: 1.6,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            If your account exists, a password reset link has been generated. Check your console logs or email inbox to proceed.
          </p>
          <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            autoComplete="email"
          />

          {error && <ErrorBanner message={error} />}

          <SubmitButton loading={loading} label="Send Reset Link →" />

          <p style={{
            textAlign: 'center', fontSize: 14,
            color: textColor,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: '4px 0 0',
          }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
