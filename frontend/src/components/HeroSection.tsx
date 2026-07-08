import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO, STATS } from '../data/content'
import BotScene from './BotScene'

gsap.registerPlugin(ScrollTrigger)

interface HeroSectionProps {
  theme: 'dark' | 'light'
}

export default function HeroSection({ theme }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const charRef    = useRef<HTMLDivElement>(null)
  const textRef    = useRef<HTMLDivElement>(null)
  const hintRef    = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const isDark = theme === 'dark'

  // Responsive sizing
  const sizes = useMemo(() => {
    if (typeof window === 'undefined') {
      return { orbSize: 520, desktopHeight: '110vh', heroHeight: '100vh' }
    }
    
    const vw = window.innerWidth
    const vh = window.innerHeight
    
    // Mobile (< 640px)
    if (vw < 640) {
      return {
        orbSize: Math.min(280, vh * 0.35),
        desktopHeight: vh < 600 ? '140vh' : '120vh',
        heroHeight: '100vh',
      }
    }
    // Tablet (640-1024px)
    if (vw < 1024) {
      return {
        orbSize: Math.min(380, vh * 0.45),
        desktopHeight: '115vh',
        heroHeight: '100vh',
      }
    }
    // Desktop (> 1024px)
    return {
      orbSize: Math.min(520, vh * 0.55),
      desktopHeight: '110vh',
      heroHeight: '100vh',
    }
  }, [])

  const [isUnlocked, setIsUnlocked] = useState(false)
  const animRunningRef = useRef(false)
  const isUnlockedRef = useRef(false)

  // Sync ref with state for event listeners
  useEffect(() => {
    isUnlockedRef.current = isUnlocked
  }, [isUnlocked])

  // Scroll lock styling helper
  useEffect(() => {
    if (!isUnlocked) {
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isUnlocked])

  useEffect(() => {
    if (isUnlocked) return

    // Set initial states for elements
    gsap.set(charRef.current, { x: 0, scale: 1.0, opacity: 1 })
    gsap.set(textRef.current, { x: -80, opacity: 0 })
    gsap.set(hintRef.current, { opacity: 1, y: 0 })

    const triggerAnimation = () => {
      if (animRunningRef.current || isUnlockedRef.current) return
      animRunningRef.current = true

      const vw = window.innerWidth
      const isMobile = vw < 768
      const orbShiftX = isMobile ? 0 : vw * 0.22

      const tl = gsap.timeline({
        onComplete: () => {
          setIsUnlocked(true)
          animRunningRef.current = false
        }
      })

      // Orb: morph/spin, scale down, shift right
      const progressObj = { value: 0 }
      tl.to(progressObj, {
        value: 1,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => setScrollProgress(progressObj.value)
      }, 0)

      tl.to(charRef.current, {
        x: orbShiftX,
        scale: 0.65,
        duration: 1.8,
        ease: 'power3.inOut',
      }, 0)

      // Text: slide in
      tl.to(textRef.current, {
        x: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
      }, 0.3)

      // Hint: fade out
      tl.to(hintRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
      }, 0)
    }

    const handleWheel = (e: WheelEvent) => {
      if (isUnlockedRef.current) return
      e.preventDefault()
      if (e.deltaY > 0) {
        triggerAnimation()
      }
    }

    const touchStartY = { current: 0 }
    const handleTouchStart = (e: TouchEvent) => {
      if (isUnlockedRef.current) return
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isUnlockedRef.current) return
      e.preventDefault()
      const touchY = e.touches[0].clientY
      const diffY = touchStartY.current - touchY
      if (diffY > 10) {
        triggerAnimation()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlockedRef.current) return
      if (['ArrowDown', 'Space', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        triggerAnimation()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('keydown', handleKeyDown, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isUnlocked])

  return (
    <div
      ref={sectionRef}
      style={{
        height: sizes.desktopHeight,
        position: 'relative',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 40%, #1c0f05 0%, #0c0a09 65%)'
          : 'radial-gradient(ellipse at 50% 40%, #fef3e2 0%, #fefce8 35%, #fff7ed 65%)',
      }}
    >
      <div style={{
        position: 'sticky',
        top: 0,
        height: sizes.heroHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>

        {/* ── Orb — absolutely centered, always in the middle ── */}
        <div
          ref={charRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3,
            width: sizes.orbSize,
            height: sizes.orbSize,
          }}
        >
          <BotScene
            scrollProgress={scrollProgress}
            size={sizes.orbSize}
            theme={theme}
          />
        </div>

        {/* ── Text — slides in from the left on scroll ── */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1280,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(24px, 5vw, 80px)',
          zIndex: 4,
          pointerEvents: 'none',
        }}>
          <div
            ref={textRef}
            style={{
              width: 'min(480px, 90vw)',
              flexShrink: 0,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <TextContent isDark={isDark} />
          </div>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} style={{
          position: 'absolute',
          bottom: 'max(32px, 5vh)',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          animation: 'fade-in-up 1s ease 0.8s both',
        }}>
          <p style={{
            color: isDark ? '#78716c' : '#92400e',
            fontSize: 'clamp(10px, 2vw, 13px)',
            fontWeight: 700,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            margin: 0,
          }}>
            Explore
          </p>
          {/* Animated line */}
          <div style={{
            width: 1.5,
            height: 'clamp(32px, 4vh, 48px)',
            background: isDark
              ? 'linear-gradient(to bottom, #ea580c, transparent)'
              : 'linear-gradient(to bottom, #d97706, transparent)',
            borderRadius: 1,
            animation: 'float 1.6s ease-in-out infinite',
          }} />
        </div>

      </div>
    </div>
  )
}


function TextContent({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Badge — appears with text */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: isDark
          ? 'rgba(120,53,15,0.38)'
          : 'rgba(120,53,15,0.12)',          // ← was transparent, now visible
        border: `1px solid ${isDark
          ? 'rgba(234,88,12,0.35)'
          : 'rgba(120,53,15,0.40)'}`,        // ← darker border on light
        borderRadius: 9999,
        padding: '6px 16px',
        fontSize: 12,
        fontWeight: 700,
        color: isDark ? '#fb923c' : '#7c2d12',  // ← dark brown on light bg
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        width: 'fit-content',
      }}>
        <span style={{ animation: 'pulse-glow 2s infinite' }}>✦</span>
        Now with semantic search
      </div>

      <h1 style={{
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 900,
        fontSize: 'clamp(40px, 4.5vw, 68px)',
        lineHeight: 1.04,
        color: isDark ? '#fff7ed' : '#1c1917',
        letterSpacing: '-2px',
        margin: 0,
      }}>
        {HERO.headline}
        <br />
        <span style={{
          backgroundImage: isDark
            ? 'linear-gradient(135deg, #fb923c 0%, #fdba74 60%)'
            : 'linear-gradient(135deg, #d97706 0%, #ea580c 60%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {HERO.headlineHighlight}
        </span>
      </h1>

      <p style={{
        fontSize: 'clamp(14px, 1.2vw, 17px)',
        color: isDark ? '#a8826a' : '#44403c',
        lineHeight: 1.7,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        margin: 0,
        maxWidth: 420,
      }}>
        {HERO.subline}
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const }}>
        <a href={HERO.cta.primary.href} style={{
          background: isDark ? '#ea580c' : '#b45309',
          color: '#fff7ed',
          padding: '14px 32px',
          borderRadius: 9999,
          fontSize: 15,
          fontWeight: 800,
          textDecoration: 'none',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          boxShadow: isDark
            ? '0 8px 28px rgba(234,88,12,0.4)'
            : '0 8px 28px rgba(180,83,9,0.35)',
          transition: 'all 0.25s ease',
          display: 'inline-block',
        }}>
          {HERO.cta.primary.label}
        </a>
        <a href={HERO.cta.secondary.href} style={{
          background: 'transparent',
          color: isDark ? '#fb923c' : '#92400e',
          padding: '13px 32px',
          borderRadius: 9999,
          fontSize: 15,
          fontWeight: 700,
          textDecoration: 'none',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          border: isDark
            ? '2px solid rgba(234,88,12,0.4)'
            : '2px solid rgba(146,64,14,0.40)',
          transition: 'all 0.25s ease',
          display: 'inline-block',
        }}>
          {HERO.cta.secondary.label}
        </a>
      </div>

      <div style={{
        display: 'flex',
        gap: 32,
        paddingTop: 8,
        borderTop: `1px solid ${isDark ? 'rgba(255,247,237,0.08)' : 'rgba(28,25,23,0.08)'}`,
      }}>
        {STATS.slice(0, 3).map((s) => (
          <div key={s.label}>
            <div style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 900,
              fontSize: 26,
              color: isDark ? '#ea580c' : '#b45309',
              lineHeight: 1,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: isDark ? '#78716c' : '#57534e',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              marginTop: 4,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}