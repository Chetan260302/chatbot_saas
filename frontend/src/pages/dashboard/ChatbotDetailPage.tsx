// src/pages/dashboard/ChatbotDetailPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { chatbotsApi, documentsApi, chatApi, type Chatbot, type Document } from '../../api/chatbots'
import DashboardLayout from './DashboardLayout'
import { Card } from '../../components/ui/Card'
import { AlertDialog } from '../../components/ui/AlertDialog'
import { toast } from 'react-hot-toast'
import {
  FileText, MessageSquare, Settings, ArrowLeft, Trash2,
  Copy, Check, UploadCloud, Send, RefreshCw, Bot, BookOpen,
} from 'lucide-react'

type Tab = 'documents' | 'chat' | 'settings'

export default function ChatbotDetailPage() {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const [bot,      setBot]      = useState<Chatbot | null>(null)
  const [docs,     setDocs]     = useState<Document[]>([])
  const [tab,      setTab]      = useState<Tab>('documents')
  const [loading,  setLoading]  = useState(true)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    chatbotsApi.get(slug)
      .then((botRes) => {
        const botData = botRes.data
        setBot(botData)
        return documentsApi.list(botData.id)
      })
      .then((docsRes) => {
        if (docsRes) setDocs(docsRes.data)
      })
      .catch((err) => {
        console.error("Failed to load chatbot details:", err)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const copyEmbedCode = () => {
    if (!bot) return
    const code = `<script src="${window.location.origin}/widget.js" data-bot-id="${bot.id}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Embed code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--dash-card-border)', borderTopColor: '#fb923c',
          borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite',
        }} />
      </div>
    </DashboardLayout>
  )

  if (!bot) return (
    <DashboardLayout>
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)' }}>Chatbot not found</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{
        padding: 'clamp(24px, 3vw, 40px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/dashboard/chatbots" style={{
            color: 'var(--color-muted)',
            textDecoration: 'none',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <ArrowLeft size={14} /> Back to Chatbots
          </Link>
        </div>

        {/* Bot header banner */}
        <Card style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(234,88,12,0.15), rgba(234,88,12,0.05))',
              border: '1px solid rgba(234,88,12,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={26} color="#fb923c" />
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 22, color: 'var(--color-cream)', margin: '0 0 4px',
              }}>{bot.name}</h1>
              <p style={{
                margin: 0, fontSize: 13,
                color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
              }}>
                Domain: <strong style={{ color: '#fb923c' }}>{bot.domain}</strong> · {docs.length} document{docs.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--color-subtle)', fontFamily: 'monospace' }}>
                  ID: {bot.id}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(bot.id)
                    toast.success('Chatbot ID copied!')
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: 0,
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Quick embed buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              to="/docs"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1.5px solid transparent',
                borderRadius: '8px', padding: '10px 16px',
                color: 'var(--color-muted)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fb923c')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
            >
              <BookOpen size={15} /> Integration Guide
            </Link>
            <button
              onClick={copyEmbedCode}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.03)', border: '1.5px solid var(--dash-card-border)',
                borderRadius: '8px', padding: '10px 18px',
                color: copied ? '#4ade80' : '#fb923c', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(234,88,12,0.40)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dash-card-border)')}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy embed code'}
            </button>
          </div>
        </Card>

        {/* Tabs switcher */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--dash-sidebar)', border: '1px solid var(--dash-card-border)',
          borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content',
        }}>
          {([
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'chat', label: 'Test Chat', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings }
          ] as { id: Tab; label: string; icon: typeof FileText }[]).map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '8px 20px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: active ? 'var(--dash-active-nav-bg)' : 'transparent',
                  color:      active ? 'var(--color-cream)' : 'var(--color-muted)',
                  border:     active ? '1px solid var(--dash-active-nav-border)' : '1px solid transparent',
                  fontSize:   13, fontWeight: active ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.18s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <t.icon size={15} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ marginTop: 8 }}>
          {tab === 'documents' && (
            <DocumentsTab botId={bot.id} docs={docs} setDocs={setDocs} />
          )}
          {tab === 'chat' && (
            <ChatTab bot={bot} />
          )}
          {tab === 'settings' && (
            <SettingsTab bot={bot} setBot={setBot} onDelete={() => navigate('/dashboard/chatbots')} />
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}

// ── Documents Tab ──
function DocumentsTab({
  botId, docs, setDocs,
}: {
  botId:   string
  docs:    Document[]
  setDocs: React.Dispatch<React.SetStateAction<Document[]>>
}) {
  const inputRef         = useRef<HTMLInputElement>(null)
  const [uploading,      setUploading]      = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver,       setDragOver]       = useState(false)

  const upload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    try {
      const { data } = await documentsApi.upload(botId, file, setUploadProgress)
      setDocs(prev => [data, ...prev])
      toast.success('Document uploaded successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await documentsApi.delete(docId)
      setDocs(prev => prev.filter(d => d.id !== docId))
      toast.success('Document deleted.')
    } catch (err: any) {
      toast.error('Failed to delete document')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#fb923c' : 'var(--dash-card-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? 'rgba(234,88,12,0.06)' : 'var(--dash-card)',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={inputRef} type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]) }}
        />

        {uploading ? (
          <div>
            <p style={{ color: '#fb923c', fontFamily: 'var(--font-body)', fontSize: 14, margin: '0 0 12px' }}>
              Uploading & processing…
            </p>
            <div style={{
              height: 4, background: 'var(--dash-card-border)', borderRadius: 2,
              maxWidth: 280, margin: '0 auto',
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${uploadProgress}%`, background: '#ea580c',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: 12, fontFamily: 'var(--font-body)', margin: '8px 0 0' }}>
              {uploadProgress}%
            </p>
          </div>
        ) : (
          <>
            <UploadCloud size={36} color="#fb923c" style={{ marginBottom: 12 }} />
            <p style={{
              color: 'var(--color-cream)', fontSize: 15, fontWeight: 600,
              fontFamily: 'var(--font-body)', margin: '0 0 6px',
            }}>
              Drop a file or click to upload
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: 13, fontFamily: 'var(--font-body)', margin: 0 }}>
              PDF, DOCX, TXT · Max 50MB
            </p>
          </>
        )}
      </div>

      {/* Document list */}
      {docs.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--dash-card-border)',
          }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 600,
              color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
            }}>
              {docs.length} document{docs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {docs.map((doc, i) => (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < docs.length - 1 ? '1px solid var(--dash-card-border)' : 'none',
            }}>
              {/* File type icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(234,88,12,0.1)',
                border: '1px solid rgba(234,88,12,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}>
                <FileText size={16} color="#fb923c" />
              </div>

              {/* Doc info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontSize: 14, fontWeight: 500,
                  color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{doc.filename}</p>
                <p style={{
                  margin: '2px 0 0', fontSize: 11,
                  color: 'var(--color-subtle)', fontFamily: 'var(--font-body)',
                }}>
                  {doc.chunk_count} chunks · {(doc.file_size / 1024).toFixed(0)}KB
                </p>
              </div>

              {/* Status */}
              <StatusBadge status={doc.status} />

              {/* Delete */}
              <button
                onClick={() => handleDelete(doc.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-subtle)', fontSize: 16,
                  padding: '4px 8px', borderRadius: 6, transition: 'all 0.18s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtle)')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Document['status'] }) {
  const map = {
    ready:      { label: 'Ready',      color: '#4ade80', bg: 'rgba(34,197,94,0.12)'  },
    processing: { label: 'Processing', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    pending:    { label: 'Pending',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)'},
    failed:     { label: 'Failed',     color: '#f87171', bg: 'rgba(248,113,113,0.12)'},
  }
  const s = map[status]
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
    }}>
      {status === 'processing' && '⟳ '}{s.label}
    </span>
  )
}

// ── Chat Tab (Dynamic Loading + PERSISTENT History Support) ──
function ChatTab({ bot }: { bot: Chatbot }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input,    setInput]    = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef              = useRef<HTMLDivElement>(null)

  // Retrieve or create persistent session per bot
  const [sessionId, setSessionId] = useState(() => {
    const key = `session_${bot.id}`
    const saved = localStorage.getItem(key)
    if (saved) return saved
    const newId = `test-${Date.now()}`
    localStorage.setItem(key, newId)
    return newId
  })

  // Load chat history from API when component mounts
  useEffect(() => {
    if (!sessionId) return
    setThinking(true)
    chatApi.history(sessionId)
      .then((res) => {
        const formatted = Array.isArray(res.data)
          ? res.data.map((m: any) => ({
              role: m.role,
              content: m.content,
            }))
          : []
        setMessages(formatted)
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err)
      })
      .finally(() => {
        setThinking(false)
      })
  }, [sessionId, bot.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const msg = input.trim()
    if (!msg || thinking) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setThinking(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    await chatApi.stream(
      bot.id,
      sessionId,
      msg,
      (token) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role:    'assistant',
            content: updated[updated.length - 1].content + token,
          }
          return updated
        })
      },
      () => setThinking(false)
    )
  }

  const handleClear = () => {
    const newId = `test-${Date.now()}`
    localStorage.setItem(`session_${bot.id}`, newId)
    setSessionId(newId)
    setMessages([])
    toast.success('Chat history cleared!')
  }

  return (
    <div style={{
      background: 'var(--dash-sidebar)', border: '1px solid var(--dash-card-border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      height: 'min(600px, 70vh)',
    }}>
      {/* Chat header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--dash-card-border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#4ade80',
          boxShadow: '0 0 6px rgba(74,222,128,0.6)',
        }} />
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 600,
          color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
        }}>
          Testing "{bot.name}" · Session {sessionId.slice(-6)}
        </p>
        <button
          onClick={handleClear}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'var(--color-subtle)', fontSize: 11, cursor: 'pointer',
            fontFamily: 'var(--font-body)', padding: '4px 10px',
            borderRadius: 6, transition: 'color 0.18s',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fb923c')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtle)')}
        >
          <RefreshCw size={12} /> Reset session
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Ask anything based on your uploaded documents
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display:        'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '78%',
                  padding:  '11px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? '#ea580c' : 'var(--dash-card)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--dash-card-border)',
                  color:      'var(--color-cream)',
                  fontSize:   14,
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content || (
                    <span style={{ opacity: 0.4 }}>Thinking…</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--dash-card-border)',
        display: 'flex', gap: 10,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask a question…"
          disabled={thinking}
          style={{
            flex: 1, background: 'var(--dash-input-bg)',
            border: '1.5px solid var(--dash-input-border)', borderRadius: 10,
            padding: '11px 16px', color: 'var(--color-cream)', fontSize: 14,
            fontFamily: 'var(--font-body)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e  => (e.target.style.borderColor = 'rgba(234,88,12,0.5)')}
          onBlur={e   => (e.target.style.borderColor = 'var(--dash-input-border)')}
        />
        <button
          onClick={send}
          disabled={thinking || !input.trim()}
          style={{
            width: 42, height: 42, borderRadius: 10, border: 'none',
            background: thinking || !input.trim() ? 'rgba(234,88,12,0.3)' : '#ea580c',
            color: '#fff', fontSize: 18, cursor: thinking ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          {thinking ? '…' : <Send size={15} />}
        </button>
      </div>
    </div>
  )
}

// ── Settings Tab ──
function SettingsTab({
  bot, setBot, onDelete,
}: {
  bot:     Chatbot
  setBot:  (b: Chatbot) => void
  onDelete: () => void
}) {
  const [form,   setForm]   = useState({
    name:          bot.name,
    description:   bot.description || '',
    system_prompt: bot.system_prompt,
    domain:        bot.domain,
  })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [alertState, setAlertState] = useState<{ isOpen: boolean; step: 1 | 2 }>({ isOpen: false, step: 1 })

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await chatbotsApi.update(bot.id, form)
      setBot(data)
      setSaved(true)
      toast.success('Chatbot settings saved!')
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTrigger = () => {
    setAlertState({ isOpen: true, step: 1 })
  }

  const handleConfirmStep1 = () => {
    setAlertState({ isOpen: true, step: 2 })
  }

  const handleConfirmStep2 = async () => {
    setAlertState({ isOpen: false, step: 1 })
    try {
      await chatbotsApi.delete(bot.id)
      toast.success('Chatbot and all associated data permanently deleted.')
      onDelete()
    } catch (e: any) {
      toast.error('Failed to delete chatbot')
    }
  }

  const handleCancelAlert = () => {
    setAlertState({ isOpen: false, step: 1 })
  }

  const field = (label: string, key: keyof typeof form, multiline = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 13, fontWeight: 600,
        color: 'var(--color-cream)', opacity: 0.8, fontFamily: 'var(--font-body)',
      }}>{label}</label>
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={4}
          style={{
            background: 'var(--dash-input-bg)',
            border: '1.5px solid var(--dash-input-border)', borderRadius: 10,
            padding: '12px 14px', color: 'var(--color-cream)', fontSize: 14,
            fontFamily: 'var(--font-body)', outline: 'none',
            resize: 'vertical', transition: 'border-color 0.2s',
          }}
          onFocus={e  => (e.target.style.borderColor = 'rgba(234,88,12,0.5)')}
          onBlur={e   => (e.target.style.borderColor = 'var(--dash-input-border)')}
        />
      ) : (
        <input
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{
            background: 'var(--dash-input-bg)',
            border: '1.5px solid var(--dash-input-border)', borderRadius: 10,
            padding: '11px 14px', color: 'var(--color-cream)', fontSize: 14,
            fontFamily: 'var(--font-body)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e  => (e.target.style.borderColor = 'rgba(234,88,12,0.5)')}
          onBlur={e   => (e.target.style.borderColor = 'var(--dash-input-border)')}
        />
      )}
    </div>
  )

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 28,
      alignItems: 'flex-start',
      width: '100%',
    }}>
      {/* Left Column: General Configuration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <Card style={{
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 16, color: 'var(--color-cream)', margin: 0,
          }}>General</h3>

          {field('Chatbot name', 'name')}
          {field('Description', 'description')}
          {field('Domain', 'domain')}
          {field('System prompt', 'system_prompt', true)}

          <button onClick={save} disabled={saving} style={{
            background: saving ? 'rgba(234,88,12,0.4)' : '#ea580c',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 24px', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 6px 20px rgba(234,88,12,0.3)',
            alignSelf: 'flex-start',
          }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </Card>
      </div>

      {/* Right Column: Bot Status + Danger Zone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Bot Status Toggle */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 16, color: 'var(--color-cream)', margin: 0,
          }}>Bot Status</h3>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              <p style={{
                margin: 0, fontSize: 14, fontWeight: 600,
                color: 'var(--color-cream)', fontFamily: 'var(--font-body)',
              }}>
                {bot.is_active ? 'Active' : 'Paused'}
              </p>
              <p style={{
                margin: '4px 0 0', fontSize: 12,
                color: 'var(--color-muted)', fontFamily: 'var(--font-body)',
                lineHeight: 1.4,
              }}>
                {bot.is_active
                  ? 'Bot is live and responding to messages on embedded sites.'
                  : 'Bot is paused and will not respond to messages.'}
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const { data } = await chatbotsApi.update(bot.id, { is_active: !bot.is_active })
                  setBot(data)
                  toast.success(data.is_active ? 'Chatbot activated!' : 'Chatbot paused.')
                } catch {
                  toast.error('Failed to update bot status')
                }
              }}
              style={{
                position: 'relative',
                width: 48, height: 26, borderRadius: 13,
                border: 'none', cursor: 'pointer', flexShrink: 0,
                background: bot.is_active
                  ? 'linear-gradient(135deg, #22c55e, #4ade80)'
                  : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s',
                padding: 0,
              }}
              title={bot.is_active ? 'Click to pause bot' : 'Click to activate bot'}
            >
              <div style={{
                position: 'absolute',
                top: 3, left: bot.is_active ? 24 : 3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <div style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.20)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 16, color: '#fca5a5', margin: '0 0 8px',
          }}>Danger zone</h3>
          <p style={{
            color: 'rgba(252,165,165,0.55)', fontSize: 13,
            fontFamily: 'var(--font-body)', margin: '0 0 16px',
            lineHeight: 1.5,
          }}>
            Deleting this chatbot will also delete all its documents and conversations. This action is permanent and cannot be undone.
          </p>
          <button onClick={handleDeleteTrigger} style={{
            background: 'transparent', border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 10, padding: '9px 18px',
            color: '#f87171', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'all 0.2s',
            width: '100%',
            textAlign: 'center',
          }}
          onMouseEnter={e => {
            (e.currentTarget.style.background    = 'rgba(239,68,68,0.10)')
            ;(e.currentTarget.style.borderColor   = 'rgba(239,68,68,0.55)')
          }}
          onMouseLeave={e => {
            (e.currentTarget.style.background    = 'transparent')
            ;(e.currentTarget.style.borderColor   = 'rgba(239,68,68,0.35)')
          }}
          >
            Delete chatbot
          </button>
        </div>
      </div>

      <AlertDialog
        isOpen={alertState.isOpen && alertState.step === 1}
        title={`Delete "${bot.name}"?`}
        description="Are you sure you want to delete this chatbot? This action cannot be undone."
        confirmText="Proceed"
        cancelText="Cancel"
        onConfirm={handleConfirmStep1}
        onCancel={handleCancelAlert}
        isDanger
      />

      <AlertDialog
        isOpen={alertState.isOpen && alertState.step === 2}
        title="WARNING: Permanent Destruction"
        description="Everything related to this chatbot, including all uploaded documents and conversation logs, will be permanently destroyed and CANNOT be undone. Are you absolutely sure you want to proceed?"
        confirmText="Permanently Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmStep2}
        onCancel={handleCancelAlert}
        isDanger
      />
    </div>
  )
}