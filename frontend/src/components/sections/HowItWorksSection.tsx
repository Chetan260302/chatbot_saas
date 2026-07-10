import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'

// ── Self-serve steps (your existing content) ──────────────────
const DIY_STEPS = [
  {
    number: '01',
    icon: '📄',
    title: 'Upload your documents',
    description: 'PDF, DOCX, or plain text. Drop in your knowledge base — product docs, FAQs, manuals, anything. We handle parsing automatically.',
    color: '#ea580c',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'AI learns in minutes',
    description: 'Semantic chunking, vector embeddings, hybrid search — all happening behind the scenes. Your chatbot becomes an expert instantly.',
    color: '#fb923c',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Embed anywhere',
    description: 'One script tag. Paste it on your website, app, or portal. Fully branded chatbot goes live — no deployment, no servers, no headaches.',
    color: '#fdba74',
  },
]

// ── Managed / done-for-you steps (new content) ─────────────────
const MANAGED_STEPS = [
  {
    number: '01',
    icon: '📄',
    title: 'Provide your documents',
    description: "Send us your files, FAQs, or website URL. You don't have to worry about format or training — we handle all data parsing and structuring for you.",
    color: '#ea580c',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'We configure & train',
    description: 'Our experts set up the vector indexes, tune the semantic search model, and fine-tune system prompts so your AI has the perfect tone and accuracy.',
    color: '#fb923c',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Embed on your site',
    description: 'We deliver a customized script tag. Copy-paste it onto your website or customer portal, and your white-labeled AI goes live instantly.',
    color: '#fdba74',
  },
]

type Mode = 'diy' | 'managed'

export default function HowItWorksSection({ theme }: { theme: 'dark' | 'light' }) {
  const isDark   = theme === 'dark'
  const titleRef = useReveal<HTMLDivElement>()
  const stepsRef = useReveal<HTMLDivElement>({ delay: 100 })
  const [mode, setMode] = useState<Mode>('diy')

  const steps = mode === 'diy' ? DIY_STEPS : MANAGED_STEPS

  return (
    <section style={{
      padding: 'clamp(32px, 4vw, 56px) 0 clamp(24px, 3vw, 40px)',
      background: isDark
        ? 'linear-gradient(180deg, #0c0a09 0%, #0f0c0a 100%)'
        : 'linear-gradient(180deg, #fff7ed 0%, #fef3e2 100%)',
      position: 'relative',
    }}>

      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: '60%',
        background: isDark
          ? 'radial-gradient(ellipse, rgba(120,53,15,0.08) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(234,88,12,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">

        <div ref={titleRef} className="reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#fb923c', fontFamily: 'Plus Jakarta Sans, sans-serif',
            display: 'block', marginBottom: 16,
          }}>
            How it works
          </span>

          <h2 style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 900,
            fontSize: 'clamp(32px, 4vw, 52px)',
            color: isDark ? '#fff7ed' : '#1c1917',
            letterSpacing: '-1.5px',
            margin: '0 auto 28px', maxWidth: 520, lineHeight: 1.1,
          }}>
            From zero to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb923c, #fdba74)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              live chatbot
            </span>{' '}
            in 5 minutes
          </h2>

          {/* ── Toggle ── */}
          <div style={{
            display: 'inline-flex', gap: 4, padding: 4,
            background: isDark ? 'rgba(17,16,9,0.8)' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${isDark ? 'rgba(41,37,36,0.8)' : 'rgba(234,88,12,0.15)'}`,
            borderRadius: 9999,
          }}>
            {([
              { key: 'diy' as Mode,     label: '⚡ Do it yourself' },
              { key: 'managed' as Mode, label: '🤝 We do it for you' },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                style={{
                  padding: '9px 22px',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: mode === opt.key ? '#ea580c' : 'transparent',
                  color: mode === opt.key ? '#fff7ed' : isDark ? 'rgba(255,247,237,0.5)' : '#78716c',
                  boxShadow: mode === opt.key ? '0 4px 16px rgba(234,88,12,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Mode subtitle */}
          <p style={{
            marginTop: 16, fontSize: 13,
            color: isDark ? '#78716c' : '#78716c',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {mode === 'diy'
              ? 'Full self-serve — build and manage your chatbot yourself, anytime.'
              : 'Hand us your documents — our team builds and configures everything for you.'}
          </p>
        </div>

        {/* Steps — key forces remount so reveal animation replays on toggle */}
        <div key={mode} ref={stepsRef} className="reveal reveal-group" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          position: 'relative',
        }}>

          <div style={{
            position: 'absolute', top: 32, left: '16.66%', right: '16.66%', height: 1,
            background: isDark
              ? 'linear-gradient(90deg, #ea580c, #fb923c, #fdba74)'
              : 'linear-gradient(90deg, rgba(234,88,12,0.4), rgba(251,146,60,0.4), rgba(253,186,116,0.4))',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {steps.map((step, idx) => (
            <StepCard key={step.number} step={step} isDark={isDark} index={idx} />
          ))}
        </div>

        {/* CTA — changes based on mode */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 64 }}>
          <a
            href={mode === 'diy' ? '/register' : '/contact'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#ea580c', color: '#fff7ed',
              padding: '14px 36px', borderRadius: 9999,
              fontSize: 16, fontWeight: 800, textDecoration: 'none',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 8px 32px rgba(234,88,12,0.4)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 12px 40px rgba(234,88,12,0.55)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 8px 32px rgba(234,88,12,0.4)'
            }}
          >
            {mode === 'diy' ? 'Start building for free' : 'Request managed setup'}
            <span style={{ fontSize: 18 }}>→</span>
          </a>
          <p style={{
            marginTop: 14, fontSize: 13,
            color: isDark ? '#78716c' : '#78716c',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {mode === 'diy'
              ? 'No credit card required · Free forever plan available'
              : 'Our team responds within 24 hours'}
          </p>
        </div>

      </div>
    </section>
  )
}

function StepCard({
  step, isDark, index,
}: {
  step: typeof DIY_STEPS[0]
  isDark: boolean
  index: number
}) {
  return (
    <div style={{
      position: 'relative', textAlign: 'center',
      padding: 'clamp(28px, 3vw, 36px) clamp(20px, 2.5vw, 28px)',
      background: isDark ? 'rgba(17,16,9,0.6)' : 'rgba(255,255,255,0.7)',
      border: `1px solid ${isDark ? 'rgba(41,37,36,0.6)' : 'rgba(234,88,12,0.10)'}`,
      borderRadius: 20,
      backdropFilter: 'blur(8px)',
      zIndex: 1,
      transition: 'all 0.25s ease',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget
      el.style.transform = 'translateY(-6px)'
      el.style.borderColor = isDark ? 'rgba(251,146,60,0.25)' : 'rgba(234,88,12,0.20)'
      el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.15)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget
      el.style.transform = 'translateY(0)'
      el.style.borderColor = isDark ? 'rgba(41,37,36,0.6)' : 'rgba(234,88,12,0.10)'
      el.style.boxShadow = 'none'
    }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: `radial-gradient(circle, ${step.color}30 0%, ${step.color}10 100%)`,
        border: `2px solid ${step.color}60`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', position: 'relative', fontSize: 24,
        boxShadow: `0 0 20px ${step.color}25`,
      }}>
        {step.icon}
        <span style={{
          position: 'absolute', top: -8, right: -8,
          width: 22, height: 22, borderRadius: '50%',
          background: step.color, color: '#fff',
          fontSize: 10, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito, sans-serif',
        }}>
          {index + 1}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 18,
        color: isDark ? '#fed7aa' : '#1c1917', marginBottom: 10, lineHeight: 1.2,
      }}>
        {step.title}
      </h3>

      <p style={{
        fontSize: 14, color: isDark ? '#a8826a' : '#57534e',
        lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0,
      }}>
        {step.description}
      </p>
    </div>
  )
}