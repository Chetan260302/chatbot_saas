import { useReveal } from '../../hooks/useReveal'
import { PRICING } from '../../data/content'

export default function PricingSection({ theme }: { theme: 'dark' | 'light' }) {
  const isDark   = theme === 'dark'
  const titleRef = useReveal<HTMLDivElement>()
  const cardsRef = useReveal<HTMLDivElement>({ delay: 80 })

  return (
    <section style={{
      padding: 'clamp(48px, 6vw, 80px) 0 clamp(60px, 8vw, 100px)',
      background: isDark ? '#0c0a09' : '#fffbf5',
      position: 'relative',
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

        <div ref={titleRef} className="reveal" style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 72px)' }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: isDark ? '#fb923c' : '#b45309', fontFamily: 'Plus Jakarta Sans, sans-serif',
            display: 'block', marginBottom: 16,
          }}>
            Simple pricing
          </span>

          <h2 style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 900,
            fontSize: 'clamp(32px, 4vw, 52px)',
            color: isDark ? '#fff7ed' : '#1c1917',
            letterSpacing: '-1.5px',
            margin: '0 auto 16px', maxWidth: 500, lineHeight: 1.1,
          }}>
            Start free, scale as you{' '}
            <span style={{
              backgroundImage: isDark
                ? 'linear-gradient(135deg, #fb923c, #fdba74)'
                : 'linear-gradient(135deg, #d97706, #ea580c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>grow</span>
          </h2>

          <p style={{
            fontSize: 'clamp(14px, 1.2vw, 17px)',
            color: isDark ? '#a8826a' : '#57534e',
            maxWidth: 420, margin: '0 auto',
            lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            No setup fees. No hidden charges. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div ref={cardsRef} className="reveal reveal-group" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          alignItems: 'start',
        }}>
          {PRICING.map((plan) => (
            <PricingCard key={plan.name} plan={plan} isDark={isDark} />
          ))}
        </div>

        {/* Enterprise callout */}
        <div className="reveal" style={{
          marginTop: 'clamp(40px, 5vw, 64px)',
          textAlign: 'center',
          padding: 'clamp(24px, 3vw, 36px)',
          background: isDark ? 'rgba(17,16,9,0.5)' : 'rgba(255,255,255,0.6)',
          border: `1px solid ${isDark ? 'rgba(41,37,36,0.6)' : 'rgba(234,88,12,0.10)'}`,
          borderRadius: 20,
          backdropFilter: 'blur(8px)',
        }}>
          <p style={{
            fontSize: 'clamp(14px, 1.2vw, 16px)',
            color: isDark ? '#a8826a' : '#57534e',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: '0 0 12px',
          }}>
            Need custom limits, SSO, SLA, or on-premise deployment?
          </p>
          <a href="mailto:hello@botify.ai" style={{
            fontSize: 15, fontWeight: 700, color: '#fb923c',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(251,146,60,0.4)',
            paddingBottom: 1,
          }}>
            Talk to our team about Enterprise →
          </a>
        </div>

      </div>
    </section>
  )
}

function PricingCard({
  plan,
  isDark,
}: {
  plan: typeof PRICING[0]
  isDark: boolean
}) {
  const highlighted = plan.highlighted

  return (
    <div style={{
      position: 'relative',
      padding: highlighted ? 'clamp(28px,3vw,36px)' : 'clamp(24px,2.5vw,32px)',
      background: highlighted
        ? isDark
          ? 'linear-gradient(145deg, #1c0f05 0%, #120a03 100%)'
          : 'linear-gradient(145deg, #fff1e6 0%, #ffe8d0 100%)'
        : isDark ? '#0e0c0a' : '#ffffff',
      border: `${highlighted ? 2 : 1}px solid ${
        highlighted
          ? 'rgba(234,88,12,0.55)'
          : isDark ? 'rgba(41,37,36,0.6)' : 'rgba(234,88,12,0.10)'
      }`,
      borderRadius: 20,
      boxShadow: highlighted
        ? isDark
          ? '0 0 60px rgba(234,88,12,0.18), 0 32px 64px rgba(0,0,0,0.3)'
          : '0 0 60px rgba(234,88,12,0.10), 0 32px 64px rgba(0,0,0,0.08)'
        : 'none',
      transform: highlighted ? 'scale(1.03)' : 'scale(1)',
      transition: 'all 0.25s ease',
      zIndex: highlighted ? 2 : 1,
    }}>

      {/* Popular badge */}
      {plan.badge && (
        <div style={{
          position: 'absolute',
          top: -14, left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ea580c, #fb923c)',
          color: '#fff7ed',
          fontSize: 11,
          fontWeight: 800,
          padding: '4px 16px',
          borderRadius: 20,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(234,88,12,0.4)',
        }}>
          {plan.badge}
        </div>
      )}

      {/* Plan name */}
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: highlighted ? '#fb923c' : isDark ? '#78716c' : '#78716c',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 12,
      }}>
        {plan.name}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(32px, 4vw, 44px)',
          color: isDark ? '#fff7ed' : '#1c1917',
          lineHeight: 1,
        }}>
          {plan.price}
        </span>
        <span style={{
          fontSize: 14,
          color: isDark ? '#78716c' : '#78716c',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          marginLeft: 6,
        }}>
          / {plan.period}
        </span>
      </div>

      <p style={{
        fontSize: 13,
        color: isDark ? '#78716c' : '#78716c',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        marginBottom: 24,
        lineHeight: 1.5,
      }}>
        {plan.description}
      </p>

      {/* CTA */}
      <a href="/register" style={{
        display: 'block',
        textAlign: 'center',
        padding: '12px 24px',
        borderRadius: 9999,
        fontSize: 15,
        fontWeight: 800,
        textDecoration: 'none',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        transition: 'all 0.2s ease',
        background: highlighted ? '#ea580c' : 'transparent',
        color:      highlighted ? '#fff7ed' : isDark ? '#fb923c' : '#ea580c',
        border:     highlighted ? 'none' : `2px solid ${isDark ? 'rgba(251,146,60,0.35)' : 'rgba(234,88,12,0.35)'}`,
        boxShadow:  highlighted ? '0 8px 24px rgba(234,88,12,0.4)' : 'none',
        marginBottom: 24,
      }}>
        {plan.cta}
      </a>

      {/* Features list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map((f) => (
          <div key={f} style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 18, height: 18,
              borderRadius: '50%',
              background: highlighted
                ? 'rgba(234,88,12,0.25)'
                : isDark ? 'rgba(41,37,36,0.8)' : 'rgba(234,88,12,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, flexShrink: 0,
              color: highlighted ? '#fb923c' : isDark ? '#78716c' : '#ea580c',
            }}>
              ✓
            </span>
            <span style={{
              fontSize: 13,
              color: isDark ? '#a8826a' : '#44403c',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              {f}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}