// ============================================================
// FloatingBot — small persistent bot face that floats
// alongside the page sections (Features → HowItWorks → Pricing)
// Uses lightweight SVG — no Three.js overhead
// Appears when hero exits, disappears after pricing
// Alternates left/right per section
// Fixed: look-at tracking uses element-relative mouse position
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface FloatingBotProps {
  theme: 'dark' | 'light'
}

export default function FloatingBot({ theme }: FloatingBotProps) {
  const botRef     = useRef<HTMLDivElement>(null)
  const [visible,  setVisible]  = useState(false)
  const [side,     setSide]     = useState<'left' | 'right'>('right')
  const [blinking, setBlinking] = useState(false)
  const [pupilXY,  setPupilXY]  = useState({ x: 0, y: 0 })
  const targetRef  = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef     = useRef<number>(0)
  const isDark = theme === 'dark'

  // Mouse tracking for look-at — element-relative with smooth lerp
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!botRef.current) return
      const rect = botRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.4
      targetRef.current = {
        x: Math.max(-1, Math.min(1, (e.clientX - centerX) / maxDist)),
        y: Math.max(-1, Math.min(1, (e.clientY - centerY) / maxDist)),
      }
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const animate = () => {
      currentRef.current = {
        x: lerp(currentRef.current.x, targetRef.current.x, 0.12),
        y: lerp(currentRef.current.y, targetRef.current.y, 0.12),
      }
      setPupilXY({ ...currentRef.current })
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Blink loop
  useEffect(() => {
    const doBlink = () => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 130)
    }
    const schedule = () => setTimeout(() => { doBlink(); schedule() }, 2800 + Math.random() * 2200)
    const t = schedule()
    return () => clearTimeout(t)
  }, [])

  // Scroll-driven visibility + side switching
  useEffect(() => {
    const heroHeight = window.innerHeight * 1.55  // matches HeroSection height

    const onScroll = () => {
      const y = window.scrollY

      // Show after hero section
      if (y > heroHeight * 0.85) {
        setVisible(true)
      } else {
        setVisible(false)
        return
      }

      // Detect which section we're in and set side
      const features    = document.getElementById('features')
      const howItWorks  = document.getElementById('how-it-works')
      const pricing     = document.getElementById('pricing')

      const inSection = (el: HTMLElement | null) => {
        if (!el) return false
        const r = el.getBoundingClientRect()
        return r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4
      }

      // Hide after pricing section ends
      if (pricing) {
        const pRect = pricing.getBoundingClientRect()
        if (pRect.bottom < 0) { setVisible(false); return }
      }

      if (inSection(features))   setSide('right')
      if (inSection(howItWorks)) setSide('left')
      if (inSection(pricing))    setSide('right')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animate side change
  useEffect(() => {
    if (!botRef.current) return
    gsap.to(botRef.current, {
      x: side === 'right' ? '0%' : '0%',
      left:  side === 'left'  ? '2vw'  : 'auto',
      right: side === 'right' ? '2vw'  : 'auto',
      duration: 0.8,
      ease: 'power2.inOut',
    })
  }, [side])

  const eyeScaleY = blinking ? 0.05 : 1
  const lx = pupilXY.x * 4.5
  const ly = -pupilXY.y * 3.5

  return (
    <div
      ref={botRef}
      style={{
        position:  'fixed',
        bottom:    '5vh',
        right:     '2vw',
        zIndex:    150,
        width:     140,
        height:    140,
        opacity:   visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 20}px)`,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible ? 'float-slow 4s ease-in-out infinite' : 'none',
        filter: isDark
          ? 'drop-shadow(0 12px 24px rgba(234,88,12,0.3))'
          : 'drop-shadow(0 12px 24px rgba(194,65,12,0.18))',
      }}
    >
      {/* Ground shadow */}
      <div style={{
        position: 'absolute',
        bottom: -8, left: '50%',
        transform: 'translateX(-50%)',
        width: '55%', height: 8,
        background: isDark
          ? 'radial-gradient(ellipse, rgba(234,88,12,0.25) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(194,65,12,0.15) 0%, transparent 70%)',
        filter: 'blur(4px)',
        borderRadius: '50%',
      }} />

      <svg width={140} height={140} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="fbHead" cx="38%" cy="32%" r="68%">
            {isDark ? <>
              <stop offset="0%"   stopColor="#3d1a0a" />
              <stop offset="55%"  stopColor="#1a0a04" />
              <stop offset="100%" stopColor="#0c0604" />
            </> : <>
              <stop offset="0%"   stopColor="#fff5e6" />
              <stop offset="55%"  stopColor="#ffe8c8" />
              <stop offset="100%" stopColor="#ffd8a0" />
            </>}
          </radialGradient>
          <radialGradient id="fbRim" cx="50%" cy="50%" r="50%">
            <stop offset="78%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="90%"  stopColor={isDark ? 'rgba(251,146,60,0.40)' : 'rgba(245,158,11,0.30)'} />
            <stop offset="100%" stopColor={isDark ? 'rgba(253,186,116,0.70)' : 'rgba(251,191,36,0.55)'} />
          </radialGradient>
          <radialGradient id="fbSpec" cx="34%" cy="28%" r="38%">
            <stop offset="0%"   stopColor={isDark ? 'rgba(255,220,160,0.28)' : 'rgba(255,255,250,0.50)'} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="fbEye" cx="40%" cy="30%" r="60%">
            {isDark ? <>
              <stop offset="0%"   stopColor="#fff7ed" />
              <stop offset="100%" stopColor="#fdba74" />
            </> : <>
              <stop offset="0%"   stopColor="#1c1917" />
              <stop offset="100%" stopColor="#44403c" />
            </>}
          </radialGradient>
          <filter id="fbGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="fbClip"><circle cx="50" cy="50" r="40"/></clipPath>
        </defs>

        {/* Head */}
        <circle cx="50" cy="50" r="40" fill="url(#fbHead)" />
        <circle cx="50" cy="50" r="40" fill="url(#fbRim)" />
        <circle cx="50" cy="50" r="40" fill="url(#fbSpec)" />

        {/* Left eye */}
        <g style={{
          transform: `scaleY(${eyeScaleY})`,
          transformBox: 'fill-box',
          transformOrigin: '32px 48px',
          transition: 'transform 0.08s ease',
        }}>
          <rect
            x={32 - 6 + lx} y={48 - 10 + ly}
            width={12} height={20}
            rx={6}
            fill="url(#fbEye)"
            filter="url(#fbGlow)"
          />
          {/* Specular */}
          <ellipse cx={29 + lx} cy={43 + ly} rx={2} ry={1.5}
            fill={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)'} />
        </g>

        {/* Right eye */}
        <g style={{
          transform: `scaleY(${eyeScaleY})`,
          transformBox: 'fill-box',
          transformOrigin: '68px 48px',
          transition: 'transform 0.08s ease',
        }}>
          <rect
            x={68 - 6 + lx} y={48 - 10 + ly}
            width={12} height={20}
            rx={6}
            fill="url(#fbEye)"
            filter="url(#fbGlow)"
          />
          <ellipse cx={65 + lx} cy={43 + ly} rx={2} ry={1.5}
            fill={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.85)'} />
        </g>

        {/* Smile */}
        <path
          d="M 38 65 Q 50 72 62 65"
          fill="none"
          stroke={isDark ? '#fb923c' : '#57534e'}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.75}
        />

        {/* Cheeks */}
        <ellipse cx="28" cy="62" rx="6" ry="3.5"
          fill={isDark ? 'rgba(251,146,60,0.18)' : 'rgba(245,158,11,0.14)'} />
        <ellipse cx="72" cy="62" rx="6" ry="3.5"
          fill={isDark ? 'rgba(251,146,60,0.18)' : 'rgba(245,158,11,0.14)'} />

        {/* Antenna */}
        <line x1="50" y1="10" x2="50" y2="2"
          stroke={isDark ? '#fb923c' : '#d97706'}
          strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="50" cy="0" r="3"
          fill={isDark ? '#ea580c' : '#f59e0b'}
          filter="url(#fbGlow)" />

        {/* Status dot */}
        <circle cx="70" cy="34" r="2.5" fill="#4ade80">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  )
}