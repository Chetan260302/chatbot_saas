import { useReveal } from '../../hooks/useReveal'

const STEPS = [
  {
    number: '01',
    icon: '📄',
    title: 'Upload your documents',
    description: 'PDF, DOCX, or plain text. Drop in your knowledge base product docs, FAQs, manuals, anything. We handle parsing automatically.',
    color: '#ea580c',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'AI learns in minutes',
    description: 'Semantic chunking, vector embeddings, hybrid search all happening behind the scenes. Your chatbot becomes an expert instantly.',
    color: '#fb923c',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Embed anywhere',
    description: 'One script tag. Paste it on your website, app, or portal. Fully branded chatbot goes live no deployment, no servers, no headaches.',
    color: '#fdba74',
  },
]

export default function HowItWorksSection({ theme }: { theme: 'dark' | 'light' }) {
  const isDark   = theme === 'dark'
  const titleRef = useReveal<HTMLDivElement>()
  const stepsRef = useReveal<HTMLDivElement>({ delay: 100 })

  return (
    <section style={{
      padding: 'clamp(48px, 6vw, 80px) 0',
      background: isDark
        ? 'linear-gradient(180deg, #0c0a09 0%, #0f0c0a 100%)'
        : 'linear-gradient(180deg, #fffbf5 0%, #fef7ed 100%)',
      position: 'relative',
    }}>

      {/* Ambient blob */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '60%', height: '60%',
        background: isDark
          ? 'radial-gradient(ellipse, rgba(120,53,15,0.08) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(234,88,12,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">

        <div ref={titleRef} className="reveal" style={{ textAlign: 'center', marginBottom: 'clamp(56px, 7vw, 88px)' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: isDark ? '#fb923c' : '#b45309', fontFamily: 'Plus Jakarta Sans, sans-serif',
            display: 'block', marginBottom: 16,
          }}>
            How it works
          </span>

          <h2 style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 900,
            fontSize: 'clamp(32px, 4vw, 52px)',
            color: isDark ? '#fff7ed' : '#1c1917',
            letterSpacing: '-1.5px',
            margin: '0 auto 16px', maxWidth: 520, lineHeight: 1.1,
          }}>
            From zero to{' '}
            <span style={{
              backgroundImage: isDark
                ? 'linear-gradient(135deg, #fb923c, #fdba74)'
                : 'linear-gradient(135deg, #d97706, #ea580c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              live chatbot
            </span>{' '}
            in 5 minutes
          </h2>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="reveal reveal-group" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          position: 'relative',
        }}>

          {/* Connecting line (desktop) */}
          <div style={{
            position: 'absolute',
            top: 32,
            left: '16.66%', right: '16.66%',
            height: 1,
            background: isDark
              ? 'linear-gradient(90deg, #ea580c, #fb923c, #fdba74)'
              : 'linear-gradient(90deg, rgba(234,88,12,0.4), rgba(251,146,60,0.4), rgba(253,186,116,0.4))',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {STEPS.map((step, idx) => (
            <StepCard key={step.number} step={step} isDark={isDark} index={idx} />
          ))}
        </div>

        {/* CTA below steps */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 64 }}>
          <a href="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#ea580c',
            color: '#fff7ed',
            padding: '14px 36px',
            borderRadius: 9999,
            fontSize: 16,
            fontWeight: 800,
            textDecoration: 'none',
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
            Start building for free
            <span style={{ fontSize: 18 }}>→</span>
          </a>
          <p style={{
            marginTop: 14, fontSize: 13,
            color: isDark ? '#78716c' : '#78716c',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            No credit card required · Free forever plan available
          </p>
        </div>

      </div>
    </section>
  )
}

function StepCard({
  step,
  isDark,
  index,
}: {
  step: typeof STEPS[0]
  isDark: boolean
  index: number
}) {
  return (
    <div style={{
      position: 'relative',
      textAlign: 'center',
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
      {/* Step number circle */}
      <div style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${step.color}30 0%, ${step.color}10 100%)`,
        border: `2px solid ${step.color}60`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        position: 'relative',
        fontSize: 24,
        boxShadow: `0 0 20px ${step.color}25`,
      }}>
        {step.icon}
        {/* Number badge */}
        <span style={{
          position: 'absolute',
          top: -8, right: -8,
          width: 22, height: 22,
          borderRadius: '50%',
          background: step.color,
          color: '#fff',
          fontSize: 10,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Nunito, sans-serif',
        }}>
          {index + 1}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 18,
        color: isDark ? '#fed7aa' : '#1c1917',
        marginBottom: 10,
        lineHeight: 1.2,
      }}>
        {step.title}
      </h3>

      <p style={{
        fontSize: 14,
        color: isDark ? '#a8826a' : '#57534e',
        lineHeight: 1.7,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        margin: 0,
      }}>
        {step.description}
      </p>
    </div>
  )
}