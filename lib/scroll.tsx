'use client'

import Lenis from 'lenis'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

/* ────────────────────────────────────────────────────────────────
   Scene registry
   Every pinned scene registers its element. A single shared rAF
   loop measures all of them and writes ONE custom property — `--p`
   (0 → 1 across the pinned span). No React state, so scrubbing
   never triggers a re-render.
   ─────────────────────────────────────────────────────────────── */

type SceneOptions = {
  /** Thresholds on `--p` that fire `onStage` once per upward crossing. */
  stages?: number[]
  onStage?: (index: number, direction: 1 | -1) => void
  /** Disable scrubbing (mobile tap-driven scenes drive `--p` themselves). */
  disabled?: boolean
}

type SceneEntry = SceneOptions & {
  el: HTMLElement
  lastP: number
  lastStage: number
}

type Engine = {
  register: (entry: SceneEntry) => () => void
  getLenis: () => Lenis | null
  isReduced: () => boolean
  scrollTo: (target: string | HTMLElement) => void
}

const EngineContext = createContext<Engine | null>(null)

/** Derive a 0→1 sub-window of the scene's `--p`, entirely in CSS. */
export function seg(from: number, to: number) {
  const span = to - from
  return `clamp(0, (var(--p) - ${from}) / ${span}, 1)`
}

/** Ease-out a value already normalised to 0→1. */
export function easeOut(v: string) {
  return `calc(1 - (1 - ${v}) * (1 - ${v}))`
}

export function ScrollProvider({
  children,
  locked = false,
}: {
  children: ReactNode
  locked?: boolean
}) {
  const lenisRef = useRef<Lenis | null>(null)
  const scenesRef = useRef<Set<SceneEntry>>(new Set())
  const reducedRef = useRef(false)

  const engine = useMemo<Engine>(
    () => ({
      register: (entry) => {
        scenesRef.current.add(entry)
        return () => {
          scenesRef.current.delete(entry)
        }
      },
      getLenis: () => lenisRef.current,
      isReduced: () => reducedRef.current,
      scrollTo: (target) => {
        const lenis = lenisRef.current
        if (lenis) {
          lenis.scrollTo(target, { offset: 0, duration: 1.5 })
          return
        }
        const el =
          typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      },
    }),
    [],
  )

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedRef.current = reduced

    let lenis: Lenis | null = null
    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        // Native touch scrolling feels better than synthesised touch on mobile.
        syncTouch: false,
        touchMultiplier: 1.5,
        wheelMultiplier: 1,
      })
      lenisRef.current = lenis
    }

    let frame = 0
    // Reused buffer so the measure pass allocates nothing per frame.
    const measured: { entry: SceneEntry; p: number }[] = []

    const tick = (time: number) => {
      lenis?.raf(time)

      const vh = window.innerHeight
      measured.length = 0

      // Pass 1 — read only. Keeping all layout reads together avoids
      // interleaved read/write thrash.
      scenesRef.current.forEach((entry) => {
        if (entry.disabled) return
        const rect = entry.el.getBoundingClientRect()
        const span = entry.el.offsetHeight - vh
        let p: number
        if (span > 0) {
          p = -rect.top / span
        } else {
          p = rect.top <= 0 ? 1 : 0
        }
        p = p < 0 ? 0 : p > 1 ? 1 : p
        measured.push({ entry, p })
      })

      // Pass 2 — write only.
      for (const { entry, p } of measured) {
        if (Math.abs(p - entry.lastP) > 0.0002) {
          entry.el.style.setProperty('--p', p.toFixed(4))
          entry.lastP = p
        }
        const stages = entry.stages
        if (stages && entry.onStage) {
          let reached = -1
          for (let i = 0; i < stages.length; i++) if (p >= stages[i]) reached = i
          if (reached !== entry.lastStage) {
            const dir: 1 | -1 = reached > entry.lastStage ? 1 : -1
            // Only announce forward crossings; rewinding shouldn't re-fire sound.
            if (dir === 1 && reached >= 0) entry.onStage(reached, dir)
            entry.lastStage = reached
          }
        }
      }

      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      lenis?.destroy()
      lenisRef.current = null
    }
  }, [])

  // Loader gate — freeze scrolling until the journey is ready.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('is-locked', locked)
    const lenis = lenisRef.current
    if (locked) {
      lenis?.stop()
      window.scrollTo(0, 0)
    } else {
      lenis?.start()
    }
    return () => {
      root.classList.remove('is-locked')
    }
  }, [locked])

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
}

export function useScrollEngine() {
  const engine = useContext(EngineContext)
  if (!engine) throw new Error('useScrollEngine must be used inside <ScrollProvider>')
  return engine
}

/**
 * Attach to a `.scene` element to have `--p` scrubbed across its pinned span.
 */
export function useScene<T extends HTMLElement = HTMLDivElement>(
  options: SceneOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const engine = useScrollEngine()
  const { stages, onStage, disabled } = options

  // Keep the callback fresh without re-registering the scene each render.
  const onStageRef = useRef(onStage)
  onStageRef.current = onStage

  const stageKey = stages ? stages.join(',') : ''

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return
    const entry: SceneEntry = {
      el,
      stages: stageKey ? stageKey.split(',').map(Number) : undefined,
      onStage: (i, d) => onStageRef.current?.(i, d),
      lastP: -1,
      lastStage: -1,
    }
    return engine.register(entry)
  }, [engine, stageKey, disabled])

  return ref
}

/**
 * Media-query matcher. Starts `false` on the server and on first paint so
 * markup is deterministic, then settles after mount.
 */
export function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const apply = () => setMatches(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [query])
  return matches
}
