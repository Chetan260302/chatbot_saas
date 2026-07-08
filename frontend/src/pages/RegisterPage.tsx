// src/pages/RegisterPage.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI }      from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { toast } from 'react-hot-toast'
import { AuthLayout, FormField, ErrorBanner, SubmitButton } from './components/AuthLayout'

export default function RegisterPage() {
  const navigate   = useNavigate()
  const { setAuth, isLoggedIn } = useAuthStore()
  const { theme }  = useThemeStore()

  const [form, setForm] = useState({
    company_name: '',
    full_name:    '',
    email:        '',
    password:     '',
    confirm:      '',
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/dashboard', { replace: true })
  }, [isLoggedIn])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.company_name.trim()) return 'Company name is required'
    if (!form.full_name.trim())    return 'Your name is required'
    if (!form.email.includes('@')) return 'Enter a valid email'
    if (form.password.length < 8)  return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(form.password)) return 'Password needs at least one uppercase letter'
    if (!/\d/.test(form.password))    return 'Password needs at least one number'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    try {
      const res = await authAPI.register({
        company_name: form.company_name,
        full_name:    form.full_name,
        email:        form.email,
        password:     form.password,
      })
      setRegistered(true)
      toast.success('Registration successful! Check your email to verify.')
      if (res.dev_verification_url) {
        console.log("DEV ONLY Verification Link:", res.dev_verification_url)
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Password strength helper
  const strength = (() => {
    const p = form.password
    if (!p) return null
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/\d/.test(p))           score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })()

  return (
    <AuthLayout
      title={registered ? "Verify your email" : "Create your account"}
      subtitle={registered ? "We generated a verification link" : "Set up your AI chatbot platform in minutes"}
      wide={!registered}
    >
      {registered ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{
            color: 'var(--color-cream)', fontSize: 14, lineHeight: 1.6,
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Your registration was successful! Before you can log in, you must verify your email address.
            Check your terminal/console logs in development mode to find the verification link.
          </p>
          <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Go to Sign In →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Two columns on wider layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormField
              label="Company name"
              name="company_name"
              type="text"
              placeholder="Acme Corp"
              value={form.company_name}
              onChange={handleChange}
            />
            <FormField
              label="Your name"
              name="full_name"
              type="text"
              placeholder="John Doe"
              value={form.full_name}
              onChange={handleChange}
            />
          </div>

          <FormField
            label="Work email"
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
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {/* Password strength bar */}
          {form.password && (
            <div style={{ marginTop: -8 }}>
              <div style={{
                display: 'flex', gap: 4, marginBottom: 4,
              }}>
                {[1,2,3,4].map((n) => (
                  <div key={n} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: n <= (strength ?? 0)
                      ? n <= 1 ? '#ef4444'
                      : n <= 2 ? '#f97316'
                      : n <= 3 ? '#eab308'
                      : '#22c55e'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'background 0.3s ease',
                  }} />
                ))}
              </div>
              <p style={{
                fontSize: 11, margin: 0,
                color: strength === 4 ? '#22c55e'
                  : strength === 3 ? '#eab308'
                  : strength === 2 ? '#f97316'
                  : '#ef4444',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {strength === 4 ? 'Strong password ✓'
                 : strength === 3 ? 'Good add a symbol to make it stronger'
                 : strength === 2 ? 'Weak add uppercase + numbers'
                 : 'Too weak'}
              </p>
            </div>
          )}

          <FormField
            label="Confirm password"
            name="confirm"
            type="password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error && <ErrorBanner message={error} />}

          <SubmitButton loading={loading} label="Create account →" />

          <p style={{
            textAlign: 'center', fontSize: 12,
            color: theme === 'dark' ? 'rgba(255,247,237,0.30)' : 'rgba(28,25,23,0.45)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: 0, lineHeight: 1.5,
          }}>
            By signing up you agree to our{' '}
            <a href="#" style={{ color: '#fb923c', textDecoration: 'none' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#fb923c', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <p style={{
            textAlign: 'center', fontSize: 14,
            color: theme === 'dark' ? 'rgba(255,247,237,0.45)' : 'rgba(28,25,23,0.55)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: 0,
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>

        </form>
      )}
    </AuthLayout>
  )
}