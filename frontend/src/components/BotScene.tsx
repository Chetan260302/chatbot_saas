// ============================================================
// BotScene v5 — Plasma energy ball inspired by reference
// Dark: obsidian sphere + warm orange plasma corona
// Light: pearl white sphere + amber corona
// Electric arc lines on surface, moving outer corona
// 1-scroll = full animation
// ============================================================

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import * as THREE from 'three'

interface BotSceneProps {
  scrollProgressRef: React.MutableRefObject<number>
  theme: 'dark' | 'light'
}

export default function BotScene({ scrollProgressRef, theme }: BotSceneProps) {
  const shadowRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}>
      {/* Ground reflection */}
      <div
        ref={shadowRef}
        style={{
          position: 'absolute',
          bottom: '-1.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '3.5%',
          background: theme === 'dark'
            ? 'radial-gradient(ellipse, rgba(234,88,12,0.30) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(180,80,10,0.20) 0%, transparent 70%)',
          filter: 'blur(10px)',
          borderRadius: '50%',
          pointerEvents: 'none',  
          transition: 'opacity 0.15s ease-out, transform 0.15s ease-out, bottom 0.15s ease-out',
        }}
      />

      <Canvas
        dpr={[1, 2]}
        key="bot"
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Ambient light — slightly stronger in light theme for visibility */}
        <ambientLight intensity={theme === 'dark' ? 0.06 : 0.18} />

        {/* Key specular light — top left, warm orange */}
        <pointLight
          position={[-2.0, 2.0, 2.2]}
          intensity={theme === 'dark' ? 18 : 10}
          color={theme === 'dark' ? '#fb923c' : '#f97316'}
          decay={2}
        />

        {/* Back rim light for definition and depth */}
        <pointLight
          position={[0, 0.5, -2.8]}
          intensity={theme === 'dark' ? 6 : 4}
          color={theme === 'dark' ? '#fdba74' : '#fde68a'}
          decay={2}
        />

        {/* Additional side fill light (light theme only) for better visibility */}
        {theme === 'light' && (
          <pointLight
            position={[1.8, -1.2, 1.0]}
            intensity={3}
            color="#fde68a"
            decay={2}
          />
        )}

        <Float speed={1.4} rotationIntensity={0.07} floatIntensity={0.28}>
          <OrbGroup scrollProgressRef={scrollProgressRef} theme={theme} shadowRef={shadowRef} />
        </Float>
      </Canvas>
    </div>
  )
}

// Animated point light that orbits — creates moving energy feel
// function MovingLight({ theme }: { theme: 'dark' | 'light' }) {
//   const lightRef = useRef<THREE.PointLight>(null)
//   useFrame(({ clock }) => {
//     if (!lightRef.current) return
//     const t = clock.elapsedTime
//     lightRef.current.position.x = Math.sin(t * 0.7) * 0.8
//     lightRef.current.position.y = Math.cos(t * 0.5) * 0.6
//     lightRef.current.position.z = 1.2 + Math.sin(t * 0.9) * 0.3
//     lightRef.current.intensity  = 3 + 2 * Math.sin(t * 1.2)
//   })
//   return (
//     <pointLight
//       ref={lightRef}
//       color={theme === 'dark' ? '#ea580c' : '#f97316'}
//       decay={1.5}
//     />
//   )
// }

// ─────────────────────────────────────────────────────────────
// OrbGroup — main scene
// ─────────────────────────────────────────────────────────────
function OrbGroup({
  scrollProgressRef,
  theme,
  shadowRef,
}: {
  scrollProgressRef: React.MutableRefObject<number>
  theme: 'dark' | 'light'
  shadowRef: React.RefObject<HTMLDivElement | null>
}) {
  const groupRef   = useRef<THREE.Group>(null)
  const actualRotY = useRef(0)
  const actualScale = useRef(1)
  const isDark     = theme === 'dark'

  const interactionRef = useRef({
    type: 'none',
    until: 0,
    startTime: 0,
  })

  // Read once at render time for structural decisions (which sub-components to show)
  const scrollProgressSnap = scrollProgressRef.current
  const faceVisible = Math.max(0, Math.min(1, (scrollProgressSnap - 0.15) / 0.45)) * Math.PI > Math.PI * 0.5

  // Click & Double-click handlers using custom robust debouncing
  const lastClickTimeRef = useRef(0)
  const clickTimeoutRef = useRef<any>(null)
  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    const now = Date.now()
    if (now < interactionRef.current.until) return

    const diff = now - lastClickTimeRef.current
    lastClickTimeRef.current = now

    if (diff < 260) {
      // Double click confirmed: Cancel pending single click
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }
      interactionRef.current = {
        type: 'double_click',
        until: now + 1800,
        startTime: now,
      }
    } else {
      // Potential single click: Wait to see if double click follows
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
      clickTimeoutRef.current = setTimeout(() => {
        const triggerTime = Date.now()
        interactionRef.current = {
          type: 'click',
          until: triggerTime + 1500,
          startTime: triggerTime,
        }
        clickTimeoutRef.current = null
      }, 260)
    }
  }

  // Fast mouse velocity & direction change checker (Dizzy condition)
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() })
  const dizzyCooldownRef = useRef(0)
  const mouseHistoryRef = useRef<{ time: number; dx: number; dy: number }[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y

      mouseHistoryRef.current.push({ time: now, dx, dy })
      // Keep only movements in the last 1500ms
      mouseHistoryRef.current = mouseHistoryRef.current.filter(m => now - m.time < 1500)

      let totalDistance = 0
      let directionChanges = 0
      let lastDx = 0
      let lastDy = 0

      mouseHistoryRef.current.forEach((m) => {
        totalDistance += Math.sqrt(m.dx * m.dx + m.dy * m.dy)
        if (lastDx !== 0 && ((m.dx > 0 && lastDx < 0) || (m.dx < 0 && lastDx > 0))) {
          directionChanges++
        }
        if (lastDy !== 0 && ((m.dy > 0 && lastDy < 0) || (m.dy < 0 && lastDy > 0))) {
          directionChanges++
        }
        lastDx = m.dx
        lastDy = m.dy
      })

      const avgVelocity = totalDistance / 1500

      // Only trigger if high mouse speed AND continuous back-and-forth shaking (frequent direction flips)
      if (avgVelocity > 1.8 && directionChanges >= 6 && now > dizzyCooldownRef.current && now > interactionRef.current.until) {
        dizzyCooldownRef.current = now + 8000 // 8s cooldown
        interactionRef.current = {
          type: 'dizzy',
          until: now + 3200, // 3.2s total interaction time
          startTime: now,
        }
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const currentDomY = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return
    const nowMs = Date.now()
    const isInteracting = nowMs < interactionRef.current.until
    const currentInteraction = interactionRef.current.type

    // Read fresh scroll progress every frame for smooth animation
    const sp = scrollProgressRef.current
    const spinT = Math.max(0, Math.min(1, (sp - 0.15) / 0.45))
    const targetY = spinT * Math.PI
    const targetScale = Math.max(0.3, 1.0 - sp * 0.35)

    actualRotY.current = THREE.MathUtils.lerp(actualRotY.current, targetY, 0.07)
    actualScale.current = THREE.MathUtils.lerp(actualScale.current, targetScale, 0.07)

    // Update shadow position/scale/opacity dynamically based on current scale and scroll progress
    if (shadowRef.current) {
      const s = actualScale.current
      // Fade out shadow as we scroll past the hero (sp goes from 1.0 to 1.76)
      const shadowFade = Math.max(0, Math.min(1, 1.0 - (sp - 1.0) * 3.5))
      
      shadowRef.current.style.transform = `translateX(-50%) scale(${s})`
      shadowRef.current.style.opacity = `${s * 0.95 * shadowFade}`

      // Keep shadow close to the bottom of the shrunken orb
      const bottomOffset = -1.5 + (1 - s) * 44
      shadowRef.current.style.bottom = `${bottomOffset}%`
    }

    let targetDomY = 0

    if (isInteracting) {
      const elapsed = nowMs - interactionRef.current.startTime

      if (currentInteraction === 'dizzy') {
        const progress = elapsed / 3200
        if (progress < 0.25) {
          // Phase 1: Struggle (Jitter)
          const jitter = Math.sin(state.clock.elapsedTime * 40) * 0.04
          groupRef.current.rotation.y = actualRotY.current + jitter
          groupRef.current.rotation.z = jitter
        } else if (progress >= 0.25 && progress < 0.75) {
          // Phase 2: Dizzy (Disoriented circular wobble)
          const angle = state.clock.elapsedTime * 6
          groupRef.current.rotation.y = actualRotY.current + Math.sin(angle) * 0.08
          groupRef.current.rotation.z = Math.cos(angle) * 0.08
          groupRef.current.rotation.x = Math.sin(angle * 1.5) * 0.05
        } else {
          // Phase 3: Recovery (Steadying)
          const factor = 1 - (progress - 0.75) / 0.25
          groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, actualRotY.current, 0.1)
          groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 15) * 0.04 * factor
        }
        // Apply scroll-driven scale during dizzy (no squash/stretch override)
        const s = actualScale.current
        groupRef.current.scale.set(s, s, s)
      } else if (currentInteraction === 'click') {
        // Head tilt acknowledgment
        const progress = elapsed / 1500
        const tiltPhase = Math.sin(progress * Math.PI)
        groupRef.current.rotation.y = actualRotY.current
        groupRef.current.rotation.z = tiltPhase * 0.12
        groupRef.current.rotation.x = tiltPhase * -0.06
        // Apply scroll-driven scale during click
        const s = actualScale.current
        groupRef.current.scale.set(s, s, s)
      } else if (currentInteraction === 'double_click') {
        const progress = elapsed / 1800

        let scaleY = 1
        let scaleXZ = 1

        if (progress < 0.15) {
          // Prep squash
          const squashProgress = progress / 0.15
          scaleY = 1 - Math.sin(squashProgress * Math.PI) * 0.18
          scaleXZ = 1 / Math.sqrt(scaleY)
        } else if (progress >= 0.15 && progress < 0.85) {
          // Spin and stretch
          const spinProgress = (progress - 0.15) / 0.7
          const spinAngle = spinProgress * Math.PI * 2
          groupRef.current.rotation.y = actualRotY.current + spinAngle
          scaleY = 1.16
          scaleXZ = 0.92
        } else {
          // Landing bounce
          const landingProgress = (progress - 0.85) / 0.15
          scaleY = 1 + Math.sin(landingProgress * Math.PI) * 0.1
          scaleXZ = 1 / Math.sqrt(scaleY)
        }
        // Multiply interaction squash/stretch with scroll-driven uniform scale
        const s = actualScale.current
        groupRef.current.scale.set(scaleXZ * s, scaleY * s, scaleXZ * s)
      }
    } else {
      // Return to normal — apply scroll-driven scale
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1)
      groupRef.current.rotation.y = actualRotY.current
      const s = actualScale.current
      groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1)
    }

    // Apply HTML Canvas Translation
    currentDomY.current = THREE.MathUtils.lerp(currentDomY.current, targetDomY, 0.14)
    state.gl.domElement.style.transform = `translateY(${currentDomY.current}px)`
    groupRef.current.position.y = 0
  })

  return (
    <group ref={groupRef} onPointerDown={handlePointerDown}>

      {/* ── Core sphere — with improved materials for both themes ── */}
      <mesh>
        <sphereGeometry args={[1, 72, 72]} />
        <meshStandardMaterial
          color={isDark ? '#1a1410' : '#e8dfd0'}
          emissive={isDark ? '#ea580c' : '#f97316'}
          emissiveIntensity={isDark ? 0.28 : 0.15}
          roughness={isDark ? 0.25 : 0.40}
          metalness={isDark ? 0.12 : 0.08}
        />
      </mesh>

      {/* ── Plasma corona — outer shells ── */}
      <PlasmaCovona isDark={isDark} />

      {/* Electric arcs removed — clean sphere surface */}

      {/* ── Energy core (front, orb state) ── */}
      <EnergyCore visible={!faceVisible} isDark={isDark} />

      {/* ── Bot face (back, face state) ── */}
      <group position={[0, 0, -0.96]} rotation={[0, Math.PI, 0]}>
        <BotFace3D isDark={isDark} visible={faceVisible} interactionRef={interactionRef} />
      </group>

    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// PlasmaCovona — the radiating outer energy effect
// Improved to balance visibility with subtlety
// ─────────────────────────────────────────────────────────────
function PlasmaCovona({ isDark }: { isDark: boolean }) {
  const shells = useRef<(THREE.Mesh | null)[]>([])

  // Shell configs: scale, base opacity, speed, phase
  const shConfigs = useMemo(() => [
    { scale: 1.05, baseOp: isDark ? 0.22 : 0.14, speed: 1.1, phase: 0 },
    { scale: 1.11, baseOp: isDark ? 0.12 : 0.08, speed: 0.8, phase: 1.2 },
    { scale: 1.18, baseOp: isDark ? 0.06 : 0.04, speed: 0.6, phase: 2.4 },
    { scale: 1.26, baseOp: isDark ? 0.03 : 0.015, speed: 0.4, phase: 3.6 },
  ], [isDark])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    shells.current.forEach((mesh, i) => {
      if (!mesh) return
      const cfg = shConfigs[i]
      // Breathe with smoother animation
      const breathe = 1 + 0.025 * Math.sin(t * cfg.speed + cfg.phase)
      mesh.scale.setScalar(cfg.scale * breathe)
      // Flicker opacity with smoother transition
      ;(mesh.material as THREE.MeshBasicMaterial).opacity =
        cfg.baseOp * (0.65 + 0.35 * Math.sin(t * cfg.speed * 1.3 + cfg.phase))
    })
  })

  return (
    <>
      {shConfigs.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => { shells.current[i] = el }}
          scale={cfg.scale}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial
            color={
              i === 0 ? (isDark ? '#fb923c' : '#f97316') :
              i === 1 ? (isDark ? '#ea580c' : '#fb923c') :
              i === 2 ? (isDark ? '#c2410c' : '#fdba74') :
                        (isDark ? '#9a3412' : '#fde68a')
            }
            transparent
            opacity={cfg.baseOp}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      ))}
    </>
  )
}



// ─────────────────────────────────────────────────────────────
// EnergyCore — glowing nucleus (visible on orb side)
// Continuous smooth animation without freezing
// ─────────────────────────────────────────────────────────────
function EnergyCore({ visible, isDark }: { visible: boolean; isDark: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const r1      = useRef<THREE.Mesh>(null)
  const r2      = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Continuous pulsing with smoother easing
    if (coreRef.current) {
      const pulse = 0.75 + 0.25 * Math.sin(t * 2.5)
      coreRef.current.scale.setScalar(pulse)
    }
    // Smooth continuous rotation — no freezing
    if (r1.current) {
      r1.current.rotation.z += 0.008
    }
    if (r2.current) {
      r2.current.rotation.z -= 0.006
      r2.current.rotation.x += 0.004
    }
  })

  if (!visible) return null

  return (
    <group position={[0, 0, 0.02]}>
      {/* Bright nucleus — continuous pulse */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshBasicMaterial color={isDark ? '#fff8f0' : '#fef3c7'} />
      </mesh>

      {/* Inner halo */}
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color={isDark ? '#fb923c' : '#f97316'}
          transparent opacity={isDark ? 0.25 : 0.18} depthWrite={false}
        />
      </mesh>

      {/* Ring 1 — continuous rotation */}
      <group ref={r1} rotation={[Math.PI * 0.3, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.55, 0.009, 8, 64]} />
          <meshBasicMaterial color={isDark ? '#fb923c' : '#ea580c'} transparent opacity={isDark ? 0.55 : 0.45} />
        </mesh>
      </group>

      {/* Ring 2 — continuous rotation */}
      <group ref={r2} rotation={[Math.PI * 0.65, Math.PI * 0.25, 0]}>
        <mesh>
          <torusGeometry args={[0.48, 0.007, 8, 64]} />
          <meshBasicMaterial color={isDark ? '#fdba74' : '#fb923c'} transparent opacity={isDark ? 0.42 : 0.35} />
        </mesh>
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// BotFace3D — eyes track pointer, blink smoothly
// Simplified and robust implementation
// ─────────────────────────────────────────────────────────────
function BotFace3D({
  isDark,
  visible,
  interactionRef,
}: {
  isDark: boolean
  visible: boolean
  interactionRef: React.MutableRefObject<{
    type: string
    until: number
    startTime: number
  }>
}) {
  const leftEyeRef  = useRef<THREE.Mesh>(null)
  const rightEyeRef = useRef<THREE.Mesh>(null)


  // Blink state
  const blinkStateRef = useRef({ 
    timer: 0, 
    nextBlinkTime: 2.5 + Math.random() * 2.0,
    isBinking: false,
    blinkStartTime: 0 
  })

  const globalMouseRef = useRef({ rawX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, rawY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      globalMouseRef.current = {
        rawX: e.clientX,
        rawY: e.clientY,
      }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(({ clock, gl }) => {
    const elapsedTime = clock.elapsedTime
    const nowMs = Date.now()
    const isInteracting = nowMs < interactionRef.current.until
    const currentInteraction = interactionRef.current.type

    // Calculate canvas element center in viewport pixels
    const rect = gl.domElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate mouse offset relative to this bot instance's center
    const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.4
    const dx = (globalMouseRef.current.rawX - centerX) / maxDist
    const dy = -(globalMouseRef.current.rawY - centerY) / maxDist

    // Clamp to -1..1 range
    const normX = Math.max(-1, Math.min(1, dx))
    const normY = Math.max(-1, Math.min(1, dy))

    // ─── EYE TRACKING ───
    let trackX = normX * 0.18
    let trackY = normY * 0.12
    let eyeScaleX = 1
    let eyeScaleY = 1

    if (isInteracting) {
      const elapsed = nowMs - interactionRef.current.startTime

      if (currentInteraction === 'dizzy') {
        const progress = elapsed / 3200
        if (progress < 0.25) {
          // Struggle (shaking tracking)
          const jitter = Math.sin(clock.elapsedTime * 45) * 0.05
          trackX = normX * 0.18 + jitter
          trackY = normY * 0.12 + Math.cos(clock.elapsedTime * 45) * 0.05
        } else if (progress >= 0.25 && progress < 0.75) {
          // Dizzy (Spiraling/swirling eyes)
          const angle = clock.elapsedTime * 18
          trackX = Math.sin(angle) * 0.10
          trackY = Math.cos(angle) * 0.10
        } else {
          // Recovery (rapid double blink, track offset returns to center)
          trackX = 0
          trackY = 0
          const recoverProgress = (progress - 0.75) / 0.25
          const blinkPhase = recoverProgress * Math.PI * 2
          eyeScaleY = Math.max(0.07, 1 - Math.abs(Math.sin(blinkPhase)) * 0.93)
        }
      } else if (currentInteraction === 'click') {
        const progress = elapsed / 1500
        // Quick double blink in the first 40% of duration
        if (progress < 0.4) {
          const blinkPhase = (progress / 0.4) * Math.PI * 2
          eyeScaleY = Math.max(0.07, 1 - Math.abs(Math.sin(blinkPhase)) * 0.93)
        }
        // Pupils enlarge in mid-interaction
        if (progress > 0.3 && progress < 0.8) {
          const enlargeProgress = (progress - 0.3) / 0.5
          const enlargeFactor = Math.sin(enlargeProgress * Math.PI) * 0.35
          eyeScaleX = 1 + enlargeFactor
          eyeScaleY = eyeScaleY * (1 + enlargeFactor)
        }
      } else if (currentInteraction === 'double_click') {
        const progress = elapsed / 1800
        trackX = 0
        trackY = 0
        if (progress >= 0.15 && progress < 0.85) {
          // Closed eyes during spin
          eyeScaleY = 0.05
        } else {
          // Widen eyes prep and landing
          const widenFactor = Math.sin(progress * Math.PI) * 0.4
          eyeScaleX = 1 + widenFactor
          eyeScaleY = 1 + widenFactor
        }
      }
    }

    // Update left eye position with smooth lerp
    if (leftEyeRef.current) {
      leftEyeRef.current.position.x = THREE.MathUtils.lerp(
        leftEyeRef.current.position.x,
        -0.26 + trackX,
        0.20
      )
      leftEyeRef.current.position.y = THREE.MathUtils.lerp(
        leftEyeRef.current.position.y,
        0.10 + trackY,
        0.20
      )
      leftEyeRef.current.scale.x = eyeScaleX
      leftEyeRef.current.scale.y = eyeScaleY
    }

    // Update right eye position with smooth lerp
    if (rightEyeRef.current) {
      rightEyeRef.current.position.x = THREE.MathUtils.lerp(
        rightEyeRef.current.position.x,
        0.26 + trackX,
        0.20
      )
      rightEyeRef.current.position.y = THREE.MathUtils.lerp(
        rightEyeRef.current.position.y,
        0.10 + trackY,
        0.20
      )
      rightEyeRef.current.scale.x = eyeScaleX
      rightEyeRef.current.scale.y = eyeScaleY
    }

    // ─── STANDARD BLINK ANIMATION ───
    if (!isInteracting) {
      const blink = blinkStateRef.current

      // Check if it's time to blink
      if (elapsedTime > blink.nextBlinkTime && !blink.isBinking) {
        blink.isBinking = true
        blink.blinkStartTime = elapsedTime
      }

      // Animate blink if active
      if (blink.isBinking) {
        const blinkDuration = 0.22
        const timeSinceBlink = elapsedTime - blink.blinkStartTime

        if (timeSinceBlink < blinkDuration) {
          const blinkPhase = (timeSinceBlink / blinkDuration) * Math.PI
          const scaleY = 1 - Math.sin(blinkPhase) * 0.93

          if (leftEyeRef.current) leftEyeRef.current.scale.y = Math.max(0.07, scaleY)
          if (rightEyeRef.current) rightEyeRef.current.scale.y = Math.max(0.07, scaleY)
        } else {
          if (leftEyeRef.current) { leftEyeRef.current.scale.y = 1; leftEyeRef.current.scale.x = 1; }
          if (rightEyeRef.current) { rightEyeRef.current.scale.y = 1; rightEyeRef.current.scale.x = 1; }
          blink.isBinking = false
          blink.nextBlinkTime = elapsedTime + 2.8 + Math.random() * 2.2
        }
      } else {
        if (leftEyeRef.current) { leftEyeRef.current.scale.y = 1; leftEyeRef.current.scale.x = 1; }
        if (rightEyeRef.current) { rightEyeRef.current.scale.y = 1; rightEyeRef.current.scale.x = 1; }
      }
    }
  })

  if (!visible) return null

  return (
    <group>
      {/* Left eye */}
      <mesh ref={leftEyeRef} position={[-0.26, 0.10, 0.01]}>
        <capsuleGeometry args={[0.068, 0.20, 8, 16]} />
        <meshStandardMaterial
          color={isDark ? '#fff7ed' : '#92400e'}
          emissive={isDark ? '#fdba74' : '#fff7ed'}
          emissiveIntensity={isDark ? 0.60 : 0.70}
          roughness={0.08}
          metalness={0.15}
        />
      </mesh>

      {/* Right eye */}
      <mesh ref={rightEyeRef} position={[0.26, 0.10, 0.01]}>
        <capsuleGeometry args={[0.068, 0.20, 8, 16]} />
        <meshStandardMaterial
          color={isDark ? '#fff7ed' : '#92400e'}
          emissive={isDark ? '#fdba74' : '#fff7ed'}
          emissiveIntensity={isDark ? 0.60 : 0.70}
          roughness={0.08}
          metalness={0.15}
        />
      </mesh>

      {/* Smile */}
      <SmileLine isDark={isDark} />

      {/* Cheeks */}
      {([-0.42, 0.42] as number[]).map((x) => (
        <mesh key={x} position={[x, -0.10, 0.005]}>
          <circleGeometry args={[0.085, 16]} />
          <meshBasicMaterial
            color={isDark ? '#fb923c' : '#ea580c'}
            transparent opacity={isDark ? 0.18 : 0.22}
          />
        </mesh>
      ))}

      {/* Status dot */}
      <GreenDot />
    </group>
  )
}

function SmileLine({ isDark }: { isDark: boolean }) {
  const pts = useMemo<[number,number,number][]>(() => (
    Array.from({ length: 18 }, (_, i) => {
      const t  = i / 17
      const bx = (1-t)**2 * -0.20 + 2*(1-t)*t * 0 + t**2 * 0.20
      const by = (1-t)**2 * -0.15 + 2*(1-t)*t * -0.05 + t**2 * -0.15
      return [bx, by, 0.01]
    })
  ), [])

  return (
    <Line
      points={pts}
      color={isDark ? '#fb923c' : '#92400e'}
      lineWidth={2.2}
      transparent opacity={0.82}
    />
  )
}

function GreenDot() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    // Continuous pulsing animation
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.50 + 0.50 * Math.sin(clock.elapsedTime * 1.6)
  })
  return (
    <mesh ref={ref} position={[0.50, 0.50, 0.01]}>
      <circleGeometry args={[0.036, 16]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.8} />
    </mesh>
  )
}