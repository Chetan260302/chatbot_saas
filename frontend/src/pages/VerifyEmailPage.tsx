// src/pages/VerifyEmailPage.tsx
import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../api/auth'
import { useThemeStore } from '../store/themeStore'
import { AuthLayout } from './components/AuthLayout'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { theme } = useThemeStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const called = useRef(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing verification token.')
      setLoading(false)
      return
    }

    if (called.current) return
    called.current = true

    setError('')
    setSuccess(false)
    setLoading(true)

    authAPI.verifyEmail(token)
      .then(() => {
        setSuccess(true)
        setError('')
      })
      .catch((err: any) => {
        const msg = err.response?.data?.detail || 'Verification failed. The token may be expired.'
        setError(msg)
        setSuccess(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  const dark = theme === 'dark'
  const textColor = dark ? 'rgba(255,247,237,0.55)' : 'rgba(28,25,23,0.65)'

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirming your email address to secure your account"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
        {loading && (
          <>
            <Loader2 size={36} color="#fb923c" className="animate-spin" style={{ animation: 'spin-slow 1s linear infinite' }} />
            <p style={{ color: 'var(--color-cream)', fontSize: 14 }}>Verifying your email address...</p>
          </>
        )}

        {!loading && success && (
          <>
            <CheckCircle size={44} color="#4ade80" />
            <div>
              <p style={{ color: 'var(--color-cream)', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
                Email Verified!
              </p>
              <p style={{ color: textColor, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                Your email address has been successfully verified. You can now access all Botify services.
              </p>
            </div>
            <Link
              to="/login"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: 8,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
              }}
            >
              Sign In →
            </Link>
          </>
        )}

        {!loading && error && (
          <>
            <XCircle size={44} color="#f87171" />
            <div>
              <p style={{ color: 'var(--color-cream)', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
                Verification Failed
              </p>
              <p style={{ color: textColor, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                {error}
              </p>
            </div>
            <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600, fontSize: 14, marginTop: 8 }}>
              Go back to Sign In
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
