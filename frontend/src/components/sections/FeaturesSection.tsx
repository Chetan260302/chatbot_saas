import { useReveal } from '../../hooks/useReveal'
import { FEATURES } from '../../data/content'

export default function FeaturesSection({ theme }: { theme: 'dark' | 'light' }) {
  const isDark    = theme === 'dark'
  const titleRef  = useReveal<HTMLDivElement>({ delay: 0 })
  const gridRef   = useReveal<HTMLDivElement>({ delay: 120 })

  return (
    <section style={{
      padding: 'clamp(48px, 6vw, 80px) 0',
      position: 'relative',
      background: isDark ? '#0c0a09' : '#fffbf5',
    }}>
      {/* Top divider */}
      <div style={{
        height: 1,
        background: isDark
          ? 'linear-gradient(90deg, transparent, rgba(251,146,60,0.15) 30%, rgba(251,146,60,0.15) 70%, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(234,88,12,0.12) 30%, rgba(234,88,12,0.12) 70%, transparent)',
        marginBottom: 'clamp(32px, 4vw, 56px)',
      }} />

      <div className="container">

        {/* Header */}
        <div ref={titleRef} className="reveal" style={{
          textAlign: 'center',
          marginBottom: 'clamp(48px, 6vw, 72px)',
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: isDark ? '#fb923c' : '#b45309',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            marginBottom: 16,
          }}>
            Everything you need
          </span>

          <h2 style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(32px, 4vw, 52px)',
            color: isDark ? '#fff7ed' : '#1c1917',
            letterSpacing: '-1.5px',
            margin: '0 auto 16px',
            maxWidth: 600,
            lineHeight: 1.1,
          }}>
            Built for businesses, <span style={{
              backgroundImage: isDark
                ? 'linear-gradient(135deg, #fb923c, #fdba74)'
                : 'linear-gradient(135deg, #d97706, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>not developers</span>
          </h2>

          <p style={{
            fontSize: 'clamp(14px, 1.2vw, 17px)',
            color: isDark ? '#a8826a' : '#57534e',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.7,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Upload your documents, configure your bot, embed it.
            No code required. No PhD in AI needed.
          </p>
        </div>

        {/* Feature grid */}
        <div ref={gridRef} className="reveal reveal-group" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
        }}>
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} isDark={isDark} />
          ))}
        </div>

      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  isDark,
}: {
  feature: { icon: string; title: string; description: string; badge?: string }
  isDark: boolean
}) {
  return (
    <div
      style={{
        background: isDark ? '#111009' : '#fffefb',
        border: `1px solid ${isDark ? 'rgba(41,37,36,0.8)' : 'rgba(180,83,9,0.10)'}`,
        borderRadius: 18,
        padding: 'clamp(20px, 2.5vw, 28px)',
        transition: 'all 0.25s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-5px)'
        el.style.borderColor = isDark ? 'rgba(251,146,60,0.30)' : 'rgba(234,88,12,0.25)'
        el.style.boxShadow = isDark
          ? '0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(251,146,60,0.15)'
          : '0 20px 48px rgba(0,0,0,0.08), 0 0 0 1px rgba(234,88,12,0.12)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.borderColor = isDark ? 'rgba(41,37,36,0.8)' : 'rgba(234,88,12,0.10)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Subtle gradient corner */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: 80, height: 80,
        background: isDark
          ? 'radial-gradient(circle at top right, rgba(251,146,60,0.06), transparent 70%)'
          : 'radial-gradient(circle at top right, rgba(234,88,12,0.05), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: isDark ? 'rgba(120,53,15,0.4)' : 'rgba(120,53,15,0.10)',
        border: `1px solid ${isDark ? 'rgba(234,88,12,0.25)' : 'rgba(234,88,12,0.20)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        marginBottom: 16,
      }}>
        {feature.icon}
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          color: isDark ? '#fed7aa' : '#1c1917',
        }}>
          {feature.title}
        </span>
        {feature.badge && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            background: isDark ? '#431407' : 'rgba(120,53,15,0.10)',
            color: '#fb923c',
            border: '1px solid rgba(234,88,12,0.25)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            {feature.badge}
          </span>
        )}
      </div>

      <p style={{
        fontSize: 14,
        color: isDark ? '#a8826a' : '#57534e',
        lineHeight: 1.65,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        margin: 0,
      }}>
        {feature.description}
      </p>
    </div>
  )
}