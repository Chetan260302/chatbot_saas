// src/pages/dashboard/CreateChatbotPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatbotsApi } from '../../api/chatbots'
import DashboardLayout from './DashboardLayout'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import {
  Globe, GraduationCap, ShoppingCart, Scale, Users,
  Lightbulb, FileText, MessageSquare, AlertTriangle, ArrowLeft,
} from 'lucide-react'

const DOMAINS = [
  { value: 'general',   Icon: Globe,          label: 'General',    desc: 'Works for any document type' },
  { value: 'education', Icon: GraduationCap,  label: 'Education',  desc: 'Academic reports, student docs' },
  { value: 'ecommerce', Icon: ShoppingCart,    label: 'E-commerce', desc: 'Products, returns, shipping' },
  { value: 'legal',     Icon: Scale,           label: 'Legal',      desc: 'Contracts, policies, compliance' },
  { value: 'hr',        Icon: Users,           label: 'HR',         desc: 'Employee handbook, policies' },
]

export default function CreateChatbotPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:          '',
    description:   '',
    domain:        'general',
    system_prompt: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const { data } = await chatbotsApi.create({
        name:          form.name,
        description:   form.description || undefined,
        domain:        form.domain,
        system_prompt: form.system_prompt || undefined,
      })
      navigate(`/dashboard/chatbots/${data.slug || data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create chatbot')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--dash-input-bg)',
    border: '1.5px solid var(--dash-input-border)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    color: 'var(--color-cream)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--color-cream)',
    fontFamily: 'var(--font-body)',
    opacity: 0.8,
  }

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box',
      }}>
        {/* Back link */}
        <button
          onClick={() => navigate('/dashboard/chatbots')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', fontSize: 13, fontFamily: 'var(--font-body)',
            padding: 0, marginBottom: 24,
          }}
        >
          <ArrowLeft size={15} /> Back to Chatbots
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: 32,
          alignItems: 'start',
        }}>
          {/* ── Left: Form ── */}
          <div>
            <PageHeader
              title="Create a new chatbot"
              subtitle="Configure your bot details. You can upload documents and test on the next screen."
            />
            <div style={{ height: 20 }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Chatbot name *</label>
                <input
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
                  placeholder="Support Bot, Sales Assistant…"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,88,12,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
                />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>
                  Description <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does this chatbot help with?"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,88,12,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
                />
              </div>

              {/* Domain picker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={labelStyle}>Domain helps improve retrieval accuracy</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                  {DOMAINS.map((d) => {
                    const selected = form.domain === d.value
                    return (
                      <div
                        key={d.value}
                        onClick={() => setForm(f => ({ ...f, domain: d.value }))}
                        style={{
                          padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: selected ? 'rgba(234,88,12,0.10)' : 'var(--dash-card)',
                          border: `1.5px solid ${selected ? 'rgba(234,88,12,0.40)' : 'var(--dash-card-border)'}`,
                          transition: 'all 0.18s',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}
                      >
                        <d.Icon size={16} color={selected ? '#fb923c' : 'var(--color-muted)'} strokeWidth={1.8} />
                        <div>
                          <p style={{
                            margin: 0, fontSize: 13, fontWeight: 600,
                            color: selected ? '#fb923c' : 'var(--color-cream)',
                            fontFamily: 'var(--font-body)',
                          }}>{d.label}</p>
                          <p style={{
                            margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted)',
                            fontFamily: 'var(--font-body)',
                          }}>{d.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* System prompt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>
                  System prompt <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optional we use a smart default)</span>
                </label>
                <textarea
                  value={form.system_prompt}
                  onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))}
                  rows={3}
                  placeholder="You are a helpful assistant for Acme Corp. Answer questions based only on provided documents…"
                  style={{
                    ...inputStyle,
                    resize: 'vertical', lineHeight: 1.6,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(234,88,12,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--dash-input-border)')}
                />
              </div>

              {error && (
                <div style={{
                  padding: '11px 14px', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.20)', borderRadius: '8px',
                  color: '#fca5a5', fontSize: 13, fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={loading} style={{
                  background: loading ? 'rgba(234,88,12,0.4)' : '#ea580c',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '12px 26px', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(234,88,12,0.3)',
                  transition: 'all 0.15s',
                }}>
                  {loading ? 'Creating…' : 'Create chatbot →'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/chatbots')}
                  style={{
                    background: 'transparent', border: '1.5px solid var(--dash-card-border)',
                    borderRadius: '10px', padding: '12px 22px',
                    color: 'var(--color-muted)', fontSize: 14,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* ── Right: Tips panel ── */}
          <div style={{
            position: 'sticky', top: 40,
            display: 'flex', flexDirection: 'column', gap: 16,
            paddingTop: 56,
          }}>
            <Card style={{
              background: 'rgba(234,88,12,0.04)', borderColor: 'rgba(234,88,12,0.12)',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lightbulb size={18} color="#fb923c" strokeWidth={2} />
                <h3 style={{
                  margin: 0, fontSize: 15, fontWeight: 700,
                  color: 'var(--color-cream)', fontFamily: 'var(--font-display)',
                }}>Tips for a great chatbot</h3>
              </div>

              {[
                { icon: FileText, text: 'Upload clear, well-structured documents for best accuracy.' },
                { icon: MessageSquare, text: 'A specific system prompt helps your bot stay on-topic.' },
                { icon: Globe, text: 'Choose the right domain it optimizes chunking & retrieval.' },
              ].map(({ icon: TipIcon, text }, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <TipIcon size={15} color="#fb923c" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{
                    margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--color-muted)',
                    fontFamily: 'var(--font-body)',
                  }}>{text}</p>
                </div>
              ))}
            </Card>

            <Card>
              <h4 style={{
                margin: '0 0 8px', fontSize: 14, fontWeight: 700,
                color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
              }}>What happens next?</h4>
              <ol style={{
                margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 2,
                color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
              }}>
                <li>Create your chatbot with a name &amp; domain</li>
                <li>Upload PDF/TXT documents as knowledge</li>
                <li>Test the chatbot in the built-in chat</li>
                <li>Embed it on your website with one line of code</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}