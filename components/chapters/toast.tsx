'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { quant } from '@/lib/geom'
import { seg, useScene, useScrollEngine } from '@/lib/scroll'

const HOLD_MS = 1600
const R = 34
const CIRC = 2 * Math.PI * R

const SPARKS = Array.from({ length: 52 }, (_, i) => {
  const a = (i / 52) * Math.PI * 2 - Math.PI / 2
  const distance = 130 + ((i * 47) % 230)
  return {
    x: quant(Math.cos(a) * distance),
    y: quant(Math.sin(a) * distance * 0.72 + 70),
    c: ['#FF6B4A', '#FFB223', '#6FD8A8', '#2B4FE0'][i % 4],
    d: (i % 13) * 22,
    r: ((i * 37) % 220) - 110,
    round: i % 5 === 0,
  }
})

export function Toast({
  soundEnabled,
  onToggleSound,
  onCue,
}: {
  soundEnabled: boolean
  onToggleSound: () => void
  onCue?: (kind: 'puff') => void
}) {
  const engine = useScrollEngine()
  const ref = useScene<HTMLElement>()
  const [progress, setProgress] = useState(0)
  const [out, setOut] = useState(false)
  const [shared, setShared] = useState<string | null>(null)
  const holding = useRef(false)
  const raf = useRef(0)

  const stop = useCallback(() => {
    holding.current = false
    cancelAnimationFrame(raf.current)
    setProgress((p) => (out ? p : 0))
  }, [out])

  const start = useCallback(() => {
    if (out || holding.current) return
    holding.current = true
    const t0 = performance.now()
    const loop = (now: number) => {
      if (!holding.current) return
      const p = Math.min(1, (now - t0) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        holding.current = false
        setOut(true)
        onCue?.('puff')
        return
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
  }, [out, onCue])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const share = async () => {
    const data = {
      title: 'Happy 26th, Hrushikesh!',
      text: 'A cinematic birthday journey for Hrushikesh Behera.',
      url: typeof window !== 'undefined' ? window.location.href : '',
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data)
        setShared('Shared')
      } else {
        await navigator.clipboard.writeText(data.url)
        setShared('Link copied')
      }
    } catch {
      setShared('Share cancelled')
    }
    window.setTimeout(() => setShared(null), 2600)
  }

  const rise = seg(0, 0.26)

  return (
    <section
      id="toast"
      ref={ref}
      className="scene h-[240vh]"
      style={{ '--static-p': 0.6 } as CSSProperties}
      aria-label="Chapter seven — the toast"
    >
      <div className="scene-pin">
        <div
          className="scene-stage flex flex-col justify-between px-5 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] md:p-12"
          style={{ '--rise': rise } as CSSProperties}
        >
          <div className="flex items-start justify-between">
            <p className="label">Chapter 07 — The Toast</p>
            <p className="label hidden md:block">{out ? 'Wish sent' : 'Candle lit'}</p>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center gap-4">
            {/* sculpture: 2 | candle | 6 */}
            <div
              className="relative flex items-end justify-center"
              style={{
                transform: `translateY(calc((1 - var(--rise)) * 3rem)) scale(calc(0.92 + var(--rise) * 0.08))`,
                opacity: 'var(--rise)',
              }}
            >
              <span
                className="display extrude-coral leading-none"
                style={{ fontSize: 'clamp(5rem, 16vw, 11rem)' }}
              >
                2
              </span>

              <div className="relative mx-1 flex flex-col items-center md:mx-2" style={{ marginBottom: '0.06em' }}>
                {/* The scatter origin is pinned to the flame center. */}
                {out && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 z-30 size-0 overflow-visible"
                    aria-hidden="true"
                  >
                    <span className="toast-flash absolute left-0 top-[clamp(1.25rem,3vw,2.75rem)] size-24 rounded-full bg-marigold" />
                    <span className="toast-ring absolute left-0 top-[clamp(1.25rem,3vw,2.75rem)] size-28 rounded-full border-2 border-coral" />
                    <span className="toast-ring toast-ring-late absolute left-0 top-[clamp(1.25rem,3vw,2.75rem)] size-28 rounded-full border-2 border-ink" />
                    {SPARKS.map((s, i) => (
                      <span
                        key={i}
                        className="toast-confetti absolute left-0 top-[clamp(1.25rem,3vw,2.75rem)] h-4 w-2"
                        style={{
                          background: s.c,
                          borderRadius: s.round ? '999px' : i % 3 === 0 ? '50% 0' : '1px',
                          ['--tx' as string]: `${s.x}px`,
                          ['--ty' as string]: `${s.y}px`,
                          ['--spin' as string]: `${s.r + 540}deg`,
                          ['--delay' as string]: `${s.d}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* flame */}
                <svg
                  viewBox="0 0 60 100"
                  className="w-[6vw] max-w-11"
                  style={{
                    aspectRatio: '0.6',
                    opacity: out ? 0 : 1,
                    transform: out ? 'translateY(-14px) scale(0.4) rotate(14deg)' : 'none',
                    transition: 'opacity 520ms ease, transform 520ms ease',
                  }}
                  aria-hidden="true"
                >
                  <g className={out ? undefined : 'anim-flicker'}>
                    <path
                      d="M30 2 C 46 34 54 52 54 64 C 54 84 43 96 30 96 C 17 96 6 84 6 64 C 6 52 14 34 30 2 Z"
                      fill="#FFB223"
                      stroke="#FF6B4A"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M30 26 C 40 48 44 58 44 66 C 44 80 38 88 30 88 C 22 88 16 80 16 66 C 16 58 20 48 30 26 Z"
                      fill="#FF6B4A"
                    />
                  </g>
                </svg>

                {/* smoke wisp */}
                {out && (
                  <svg
                    viewBox="0 0 40 90"
                    className="absolute bottom-full w-[5vw] max-w-8"
                    style={{ aspectRatio: '0.45' }}
                    aria-hidden="true"
                  >
                    <path
                      d="M20 88 C 10 70 30 58 20 42 C 12 28 28 18 20 2"
                      fill="none"
                      stroke="#2B4FE0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="anim-draw"
                      style={{ '--len': 140, '--dur': '1.6s' } as CSSProperties}
                    />
                  </svg>
                )}

                {/* wax stick */}
                <div
                  className="w-[5vw] max-w-9 border-2 border-ink bg-marigold"
                  style={{ height: 'clamp(5rem, 14vw, 11rem)' }}
                  aria-hidden="true"
                />
              </div>

              <span
                className="display extrude-ink leading-none"
                style={{ fontSize: 'clamp(5rem, 16vw, 11rem)' }}
              >
                6
              </span>
            </div>

            {/* periwinkle ground shadow */}
            <div
              className="h-2 max-w-[560px] bg-mint"
              style={{ width: `calc(var(--rise) * 54%)` }}
              aria-hidden="true"
            />

            {!out ? (
              <button
                type="button"
                onPointerDown={start}
                onPointerUp={stop}
                onPointerLeave={stop}
                onPointerCancel={stop}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    start()
                  }
                }}
                onKeyUp={stop}
                className="mt-2 flex flex-col items-center gap-2"
                aria-label="Press and hold to blow out the candle"
                style={{ opacity: seg(0.2, 0.4) }}
              >
                <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true">
                  <circle cx="40" cy="40" r={R} fill="none" stroke="#2B4FE0" strokeWidth="2" />
                  <circle
                    cx="40"
                    cy="40"
                    r={R}
                    fill="none"
                    stroke="#FF6B4A"
                    strokeWidth="4"
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC * (1 - progress)}
                  />
                  <text
                    x="40"
                    y="41"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#2B4FE0"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2 }}
                  >
                    HOLD
                  </text>
                </svg>
                <span className="label">Hold to blow out the candle</span>
              </button>
            ) : (
              <div className="anim-rise mt-2 flex flex-col items-center gap-3">
                <p className="label text-coral" role="status">
                  Wish received — make it count
                </p>
                <button
                  type="button"
                  onClick={() => engine.scrollTo('#hero')}
                  className="label border-2 border-ink px-6 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  Replay the journey
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-4">
            <h2
              className="display text-coral"
              style={{
                fontSize: 'clamp(2.6rem, 7vw, 5.5rem)',
                opacity: seg(0.3, 0.5),
                transform: `translateY(calc((1 - ${seg(0.3, 0.5)}) * 1.6rem))`,
              }}
            >
              Happy 26th
            </h2>
            <div className="flex items-center gap-2 md:gap-3">
              {shared && (
                <span className="label text-coral" role="status">
                  {shared}
                </span>
              )}
              <button
                type="button"
                onClick={share}
                className="label min-h-11 flex-1 border-2 border-ink px-3 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper md:flex-none md:px-6"
              >
                Share
              </button>
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundEnabled}
                className="label min-h-11 flex-1 border-2 border-ink px-3 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper md:flex-none md:px-6"
              >
                {soundEnabled ? 'Sound off' : 'Sound on'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
