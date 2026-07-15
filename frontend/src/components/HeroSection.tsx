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

  // Initialize scroll progress immediately to 1.76 if loaded with a hash or scroll offset
  const initialProgress = typeof window !== 'undefined' && (window.location.hash || window.scrollY > 50) ? 1.76 : 0.0
  const scrollProgressRef = useRef(initialProgress)
  const isDark = theme === 'dark'

  // Section-tracking refs (no re-renders needed)
  const currentSideRef = useRef<'left' | 'right'>('right')
  const lastSideTweenRef = useRef<gsap.core.Tween | null>(null)
  const lastOpacityTweenRef = useRef<gsap.core.Tween | null>(null)

  // Responsive sizing
  const sizes = useMemo(() => {
    if (typeof window === 'undefined') {
      return { orbSize: 520, desktopHeight: '100vh', heroHeight: '100vh' }
    }
    
    const vw = window.innerWidth
    const vh = window.innerHeight
    
    // Mobile (< 640px)
    if (vw < 640) {
      return {
        orbSize: Math.min(280, vh * 0.35),
        desktopHeight: '100vh',
        heroHeight: '100vh',
      }
    }
    // Tablet (640-1024px)
    if (vw < 1024) {
      return {
        orbSize: Math.min(380, vh * 0.45),
        desktopHeight: '100vh',
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

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!window.location.hash || window.scrollY > 50
    }
    return false
  })
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

  // Automatically unlock if page is scrolled or has a hash (handles refresh at hash, back/forward, and navbar clicks)
  useEffect(() => {
    const handleScrollCheck = () => {
      if (window.scrollY > 50 || window.location.hash) {
        setIsUnlocked(true)
        scrollProgressRef.current = 1.0
      }
    }
    
    window.addEventListener('scroll', handleScrollCheck, { passive: true })
    window.addEventListener('hashchange', handleScrollCheck, { passive: true })
    
    // Run initial check
    handleScrollCheck()
    
    return () => {
      window.removeEventListener('scroll', handleScrollCheck)
      window.removeEventListener('hashchange', handleScrollCheck)
    }
  }, [])

  // ── Intro animation (before unlock) ──
  useEffect(() => {
    if (isUnlocked) return

    // Set initial states for elements
    if (charRef.current) {
      charRef.current.style.width  = `${sizes.orbSize}px`
      charRef.current.style.height = `${sizes.orbSize}px`
    }
    gsap.set(charRef.current, { x: 0, y: 0, opacity: 1 })
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

      // Move the container right
      tl.to(charRef.current, {
        x: orbShiftX,
        duration: 1.8,
        ease: 'power3.inOut',
      }, 0)

      // Drive scrollProgress 0→1 via the ref (BotScene reads it in useFrame)
      const progressObj = { value: 0 }
      tl.to(progressObj, {
        value: 1,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => {
            scrollProgressRef.current = progressObj.value
        }
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

  // ── Post-hero: scroll-driven transition + section tracking ──
  // The SAME bot smoothly flies from its hero position to the top-right corner,
  // shrinking further via scrollProgress. Then it tracks active sections.
  useEffect(() => {
    if (!isUnlocked || !charRef.current) return

    const el = charRef.current

    const onScroll = () => {
      const y = window.scrollY
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isMobile = vw < 768

      // ── Transition progress: 0 at top, 1 when hero is fully scrolled out ──
      const transitionRange = vh * 0.8
      const rawT = y / transitionRange
      const t = Math.max(0, Math.min(1, rawT))

      // Easing (ease-in-out quad) for smooth visual interpolation
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      // ── Update 3D scroll progress: 1 (hero end) → 1.76 (section bot size) ──
      scrollProgressRef.current = 1 + eased * 0.76

      // ── Position math ──
      const padding = Math.max(24, vw * 0.03)
      const orbShiftX = isMobile ? 0 : vw * 0.22

      // Visual size at full transition (scrollProgress = 1.76)
      const endVisualSize = sizes.orbSize * Math.max(0.3, 1.0 - 1.76 * 0.35)

      // Start: hero end position (GSAP x offset from center)
      const startX = orbShiftX
      const startY = 0

      // End: position offsets from the element's natural center (which is viewport center)
      // Visual center vertically aligned to middle (offset y = 0)
      const endX_right = vw / 2 - padding - endVisualSize / 2
      const endX_left  = padding + endVisualSize / 2 - vw / 2
      const endY = 0

      if (t < 1) {
        // ── Phase A: Transitioning from hero → section bot ──
        // Kill active GSAP side/opacity tweens so they don't override our manual scroll-driven position
        if (lastSideTweenRef.current) {
          lastSideTweenRef.current.kill()
          lastSideTweenRef.current = null
        }
        if (lastOpacityTweenRef.current) {
          lastOpacityTweenRef.current.kill()
          lastOpacityTweenRef.current = null
        }

        // Reset side to right when near the top of the hero section
        if (t < 0.05) {
          currentSideRef.current = 'right'
        }

        const side = currentSideRef.current
        const endX = side === 'right' ? endX_right : endX_left

        const currentX = startX + (endX - startX) * eased
        const currentY = startY + (endY - startY) * eased

        gsap.set(el, { x: currentX, y: currentY })

        // Z-index: rise above page content partway through transition
        el.style.zIndex = t > 0.3 ? '150' : '2'
        el.style.pointerEvents = 'auto'
        el.style.opacity = '1'

      } else {
        // ── Phase B: Fully transitioned — section tracking mode ──
        scrollProgressRef.current = 1.76 // Ensure scroll progress is set to maximum so bot is shrunken
        el.style.zIndex = '150'

        // Determine which section is closest to viewport center
        const features   = document.getElementById('features')
        const howItWorks = document.getElementById('how-it-works')
        const pricing    = document.getElementById('pricing')

        const getCenterDist = (section: HTMLElement | null) => {
          if (!section) return Infinity
          const r = section.getBoundingClientRect()
          return Math.abs(r.top + r.height / 2 - vh / 2)
        }

        const fDist = getCenterDist(features)
        const hDist = getCenterDist(howItWorks)
        const pDist = getCenterDist(pricing)
        const minDist = Math.min(fDist, hDist, pDist)

        let newSide: 'left' | 'right' = 'right'
        if (minDist === hDist) newSide = 'left'

        // Animate side switch smoothly
        if (newSide !== currentSideRef.current) {
          currentSideRef.current = newSide
          if (lastSideTweenRef.current) lastSideTweenRef.current.kill()
          lastSideTweenRef.current = gsap.to(el, {
            x: newSide === 'right' ? endX_right : endX_left,
            y: endY,
            duration: 0.9,
            ease: 'power3.out',
          })
        } else if (!lastSideTweenRef.current) {
          // If side matches initial side and no animation has positioned it yet, set position instantly
          gsap.set(el, {
            x: newSide === 'right' ? endX_right : endX_left,
            y: endY,
          })
        }

        // Visibility: hide near footer
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight
        let shouldHide = false
        if (y > scrollHeight - clientHeight - 200) shouldHide = true
        if (pricing) {
          const pRect = pricing.getBoundingClientRect()
          if (pRect.bottom < 100) shouldHide = true
        }

        if (lastOpacityTweenRef.current) lastOpacityTweenRef.current.kill()
        lastOpacityTweenRef.current = gsap.to(el, {
          opacity: shouldHide ? 0 : 1,
          y: shouldHide ? endY - 30 : endY,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        el.style.pointerEvents = shouldHide ? 'none' : 'auto'
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (lastSideTweenRef.current) lastSideTweenRef.current.kill()
      if (lastOpacityTweenRef.current) lastOpacityTweenRef.current.kill()
    }
  }, [isUnlocked, sizes.orbSize])

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
      {/* ── Fixed Bot — starts centered in hero, transitions to section-bot corner ── */}
      <div
        ref={charRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          marginTop:  -sizes.orbSize / 2,
          marginLeft: -sizes.orbSize / 2,
          width:  sizes.orbSize,
          height: sizes.orbSize,
          zIndex: 2,
          pointerEvents: 'auto',
        }}
      >
        <BotScene scrollProgressRef={scrollProgressRef} theme={theme} />
      </div>

      {/* ── Sticky Hero Content ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: sizes.heroHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 5,
        pointerEvents: 'none',
      }}>

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

        {/* Scroll hint — positioned inside the full-width sticky viewport to guarantee visual center without scrolling off-viewport */}
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
          pointerEvents: 'none',
        }}>
          <p style={{
            color: isDark ? '#78716c' : '#92400e',
            fontSize: 'clamp(10px, 2vw, 13px)',
            fontWeight: 700,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            paddingLeft: '0.18em', // Symmetrically offset the right-side letter-spacing to center the text perfectly
            margin: 0,
          }}>
            Explore
          </p>
          {/* Animated line */}
          <div style={{
            width: 2, // 2px width centers perfectly without subpixel browser snap offsets
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
          : 'rgba(120,53,15,0.12)',
        border: `1px solid ${isDark
          ? 'rgba(234,88,12,0.35)'
          : 'rgba(120,53,15,0.40)'}`,
        borderRadius: 9999,
        padding: '6px 16px',
        fontSize: 12,
        fontWeight: 700,
        color: isDark ? '#fb923c' : '#7c2d12',
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

      <p style={{
        margin: '4px 0 0',
        fontSize: 10,
        fontStyle: 'italic',
        color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.45)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        textAlign: 'left',
      }}>
        * Statistics displayed above are simulated for demonstration purposes.
      </p>
    </div>
  )
}