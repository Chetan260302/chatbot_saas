// src/pages/ResetPasswordPage.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI }      from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { toast } from 'react-hot-toast'
import { AuthLayout, FormField, ErrorBanner, SubmitButton } from './components/AuthLayout'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { theme }  = useThemeStore()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Already logged in? → dashboard
  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true })
    if (!token) {
      setError('Invalid or missing password reset token.')
    }
  }, [isLoggedIn, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError('Missing reset token.')
      return
    }
    if (!form.password || !form.confirm) {
      setError('All password fields are required')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    try {
      await authAPI.resetPassword({
        token,
        new_password: form.password,
      })
      setSuccess(true)
      toast.success('Password reset successfully!')
    } catch (err: any) {
      const msg = err.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const dark = theme === 'dark'
  const textColor = dark ? 'rgba(255,247,237,0.45)' : 'rgba(28,25,23,0.55)'

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      {success ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{
            color: 'var(--color-cream)', fontSize: 14, lineHeight: 1.6,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Your password has been successfully updated. You can now log back in with your new credentials.
          </p>
          <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Go to Sign In →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FormField
            label="New Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => {
              setForm(f => ({ ...f, password: e.target.value }))
              setError('')
            }}
          />

          <FormField
            label="Confirm New Password"
            name="confirm"
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e) => {
              setForm(f => ({ ...f, confirm: e.target.value }))
              setError('')
            }}
          />

          {error && <ErrorBanner message={error} />}

          <SubmitButton loading={loading || !token} label="Reset Password" />

          <p style={{
            textAlign: 'center', fontSize: 14,
            color: textColor,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: '4px 0 0',
          }}>
            Return to{' '}
            <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
