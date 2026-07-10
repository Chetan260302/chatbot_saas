// src/pages/ContactPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import { AuthLayout, FormField, SubmitButton } from './components/AuthLayout'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const { theme } = useThemeStore()
  const dark = theme === 'dark'

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [textareaFocused, setTextareaFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending lead to admin email
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('Lead collected successfully:', form)
      toast.success('Message sent! We will contact you soon.')
      setSubmitted(true)
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputBg = dark ? 'rgba(255,255,255,0.04)' : '#ffffff'
  const inputBgFocus = dark ? 'rgba(120,53,15,0.12)' : 'rgba(234,88,12,0.04)'
  const inputBorder = dark ? 'rgba(41,37,36,0.8)' : 'rgba(214,211,209,1)'
  const inputFocus = 'rgba(234,88,12,0.55)'
  const textColor = dark ? '#fff7ed' : '#1c1917'
  const labelColor = dark ? 'rgba(255,247,237,0.70)' : 'rgba(28,25,23,0.70)'
  const textMuted = dark ? 'rgba(255,247,237,0.45)' : 'rgba(28,25,23,0.55)'

  if (submitted) {
    return (
      <AuthLayout
        title="Thank you! 🤝"
        subtitle="Your request has been received."
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            fontSize: 48,
            animation: 'pulse-glow 2s infinite',
          }}>
            📩
          </div>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: textColor,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: 0,
          }}>
            We've received your request for a managed chatbot setup. Our experts will review your details and reach out via <strong>{form.email}</strong> within 24 hours.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              background: '#ea580c',
              color: '#fff7ed',
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              textDecoration: 'none',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 8px 24px rgba(234,88,12,0.3)',
              marginTop: 10,
            }}
          >
            Return to Homepage
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Request Managed Setup"
      subtitle="Let our experts build, train, and integrate your custom AI chatbot."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <FormField
          label="Your Name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
        />

        <FormField
          label="Work Email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange}
        />

        <FormField
          label="Company Name"
          name="company"
          type="text"
          placeholder="Acme Corp"
          value={form.company}
          onChange={handleChange}
        />

        {/* Custom FormField for Textarea message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{
            fontSize: 13,
            fontWeight: 600,
            color: labelColor,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Tell us about your requirements
          </label>
          <textarea
            name="message"
            placeholder="Describe what you want your chatbot to do, the documents you want to train it on, etc..."
            value={form.message}
            onChange={handleChange}
            onFocus={() => setTextareaFocused(true)}
            onBlur={() => setTextareaFocused(false)}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: textareaFocused ? inputBgFocus : inputBg,
              border: `1.5px solid ${textareaFocused ? inputFocus : inputBorder}`,
              borderRadius: 10,
              color: textColor,
              fontSize: 15,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: textareaFocused ? '0 0 0 3px rgba(234,88,12,0.10)' : 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <SubmitButton loading={loading} label="Submit Request →" />

        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: textMuted,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          margin: '4px 0 0',
        }}>
          Prefer self-serve?{' '}
          <Link to="/register" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
            Start free trial
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
