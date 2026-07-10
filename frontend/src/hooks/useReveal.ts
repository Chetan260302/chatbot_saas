import { useCallback, useRef } from 'react'

interface UseRevealOptions {
  threshold?: number   // 0–1, how much of element must be visible
  once?: boolean       // only trigger once (default true)
  delay?: number       // ms delay before adding .visible class
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
) {
  const { threshold = 0.15, once = true, delay = 0 } = options
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (node) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('visible')
              }, delay)
              if (once) observer.unobserve(entry.target)
            } else if (!once) {
              entry.target.classList.remove('visible')
            }
          })
        },
        { threshold }
      )
      observer.observe(node)
      observerRef.current = observer
    }
  }, [threshold, once, delay])

  return ref
}