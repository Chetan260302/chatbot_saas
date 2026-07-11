// ============================================================
// SectionBot — Persistent 3D bot across sections
// Tracks the active section and slides smoothly left/right
// across the screen. Fades out before the footer.
// Appears at the TOP of sections, continuing from the hero bot.
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BotScene from './BotScene'

interface SectionBotProps {
  theme: 'dark' | 'light'
}

const BOT_SIZE = 200 // px — the cruising size of the section bot

export default function SectionBot({ theme }: SectionBotProps) {
  const botRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const isDark = theme === 'dark'

  // Track a scroll-based scale for the entry transition
  const entryScaleRef = useRef(1)

  // Scroll visibility and section tracking
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = window.innerHeight * 0.95
      const features = document.getElementById('features')
      const howItWorks = document.getElementById('how-it-works')
      const pricing = document.getElementById('pricing')

      const y = window.scrollY

      // 1. Show only after scrolling past Hero
      let show = y > heroHeight

      // 2. Hide when near the bottom of the document (Footer area)
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      if (y > scrollHeight - clientHeight - 200) {
        show = false
      }

      // Hide also if pricing section scrolls past the screen top
      if (pricing) {
        const pRect = pricing.getBoundingClientRect()
        if (pRect.bottom < 100) {
          show = false
        }
      }

      setVisible(show)

      // Entry scale: over the first 300px past the hero, scale from 1.35→1.0
      // This creates the illusion that the hero orb "flew" into the section bot position
      const entryDistance = 300
      const pastHero = Math.max(0, y - heroHeight)
      const entryT = Math.min(1, pastHero / entryDistance)
      entryScaleRef.current = 1.35 - entryT * 0.35 // 1.35 → 1.0

      // Apply entry scale to the dedicated scale wrapper (separate from GSAP's transform)
      if (scaleRef.current) {
        scaleRef.current.style.transform = `scale(${entryScaleRef.current})`
      }

      // 3. Robust distance-based section tracking
      const getCenterDist = (el: HTMLElement | null) => {
        if (!el) return Infinity
        const r = el.getBoundingClientRect()
        const elCenter = r.top + r.height / 2
        return Math.abs(elCenter - window.innerHeight / 2)
      }

      const fDist = getCenterDist(features)
      const hDist = getCenterDist(howItWorks)
      const pDist = getCenterDist(pricing)

      const minDist = Math.min(fDist, hDist, pDist)

      if (minDist === fDist) {
        setSide('right')
      } else if (minDist === hDist) {
        setSide('left')
      } else if (minDist === pDist) {
        setSide('right')
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // Initial check
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animate the horizontal position, vertical entry, and opacity smoothly when side or visibility changes
  useEffect(() => {
    if (!botRef.current) return

    const vw = window.innerWidth
    const padding = Math.max(24, vw * 0.03)

    const targetX = side === 'left' ? padding : vw - BOT_SIZE - padding

    gsap.to(botRef.current, {
      x: targetX,
      y: visible ? 0 : -35,
      opacity: visible ? 1 : 0,
      duration: 0.9,
      ease: 'power3.out',
    })
  }, [side, visible])

  return (
    <div
      style={{
        position: 'fixed',
        top: 'max(70px, 8vh)',
        left: 0,
        width: '100vw',
        height: BOT_SIZE,
        zIndex: 150,
        pointerEvents: 'none',
      }}
    >
      {/* Outer container for GSAP transitions (sliding and fading) */}
      <div
        ref={botRef}
        style={{
          width: BOT_SIZE,
          height: BOT_SIZE,
          opacity: 0,
          pointerEvents: visible ? 'auto' : 'none',
          filter: isDark
            ? 'drop-shadow(0 12px 24px rgba(234,88,12,0.3))'
            : 'drop-shadow(0 12px 24px rgba(194,65,12,0.18))',
        }}
      >
        {/* Scale wrapper — driven by scroll, separate from GSAP's transform */}
        <div
          ref={scaleRef}
          style={{
            width: '100%',
            height: '100%',
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Inner container for independent CSS floating animation */}
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              animation: visible ? 'float 4s ease-in-out infinite' : 'none',
            }}
          >
            {/* Ground shadow */}
            <div
              style={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '55%',
                height: 8,
                background: isDark
                  ? 'radial-gradient(ellipse, rgba(234,88,12,0.25) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse, rgba(194,65,12,0.15) 0%, transparent 70%)',
                filter: 'blur(4px)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            <BotScene scrollProgressRef={entryScaleRef} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  )
}
