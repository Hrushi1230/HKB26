'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { quant } from '@/lib/geom'
import { seg, useMatchMedia, useScene } from '@/lib/scroll'

const STORE_KEY = 'journey26.wishes'
const SEEDS = ['happy 26 boss', 'keep building', 'see you soon']
const NODE_COLORS = ['#FF6B4A', '#FFB223', '#6FD8A8']

const VB = { w: 900, h: 720 }

/** Deterministic constellation layout — a phyllotaxis spiral, jittered by a
 *  hash of the wish text so every wish keeps its own stable position. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

function layout(text: string, i: number) {
  const j = hash(text)
  const a = i * 2.399963 + j * 0.9
  const r = 90 + Math.sqrt(i + 0.7) * 128
  return {
    x: quant(VB.w * 0.52 + Math.cos(a) * r * 0.62),
    y: quant(VB.h * 0.46 + Math.sin(a) * r * 0.5),
    size: quant(9 + j * 9),
    color: NODE_COLORS[Math.floor(j * NODE_COLORS.length) % NODE_COLORS.length],
  }
}

type Wish = { id: string; text: string }

export function Wishes({ onCue }: { onCue?: (kind: 'tick') => void }) {
  const compact = useMatchMedia('(max-width: 767px)')
  const ref = useScene<HTMLElement>({ disabled: compact })
  const [wishes, setWishes] = useState<Wish[]>(() => SEEDS.map((text) => ({ id: text, text })))
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const fresh = useRef<Set<string>>(new Set())

  // Hydrate saved wishes after mount so SSR markup stays deterministic.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as Wish[]
      if (Array.isArray(saved) && saved.length) {
        setWishes((prev) => [...prev, ...saved.filter((w) => w?.text)])
      }
    } catch {
      /* corrupted store — ignore */
    }
  }, [])

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim().slice(0, 48)
    if (!text) return
    const wish = { id: `${Date.now()}`, text }
    fresh.current.add(wish.id)
    setWishes((prev) => [...prev, wish])
    setDraft('')
    setStatus(`Added “${text}” to the constellation`)
    onCue?.('tick')
    try {
      const stored = [...wishes.slice(SEEDS.length), wish]
      window.localStorage.setItem(STORE_KEY, JSON.stringify(stored))
    } catch {
      /* storage unavailable — the wish still shows this session */
    }
  }

  const reset = () => {
    try {
      window.localStorage.removeItem(STORE_KEY)
    } catch {
      /* ignore */
    }
    fresh.current.clear()
    setWishes(SEEDS.map((text) => ({ id: text, text })))
    setStatus('Wishes reset to default')
  }

  const nodes = wishes.map((w, i) => ({ ...w, ...layout(w.text, i) }))

  return (
    <section
      id="wishes"
      ref={ref}
      className={`scene ${compact ? 'min-h-[100svh] py-6' : 'h-[280vh]'}`}
      style={
        {
          '--static-p': 0.9,
          ...(compact ? { '--p': 1 } : null),
        } as CSSProperties
      }
      aria-label="Chapter six — leave a wish"
    >
      <div className={compact ? 'relative h-auto w-full' : 'scene-pin'}>
        <div className={compact ? 'relative flex flex-col w-full pt-16 pb-8' : 'scene-stage flex flex-col md:flex-row md:items-center'}>
          <p className="label absolute left-6 top-6 z-20 md:left-12 md:top-10">
            Chapter 06 — Wishes
          </p>

          {/* left: the form */}
          <div className="relative z-20 w-full px-6 pt-4 md:w-[42%] md:px-12 md:pt-0">
            <h2
              className="display text-ink"
              style={{
                fontSize: 'clamp(2.6rem, 6.6vw, 5.6rem)',
                clipPath: compact ? undefined : `inset(0 calc((1 - ${seg(0, 0.2)}) * 100%) 0 0)`,
              }}
            >
              Leave
              <br />A Wish
            </h2>

            <form onSubmit={add} className="mt-8 flex items-end gap-3" style={{ opacity: compact ? 1 : seg(0.08, 0.3) }}>
              <label className="flex-1">
                <span className="sr-only">Your wish for Hrushikesh</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault()
                  }}
                  maxLength={48}
                  placeholder="type something kind"
                  className="w-full border-b-2 border-ink bg-transparent pb-2 text-ink placeholder:text-ink/40 focus:outline-none"
                  style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
                />
              </label>
              <button
                type="submit"
                className="bg-coral px-6 py-3 text-paper transition-transform hover:scale-[1.04]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: 12 }}
              >
                ADD
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="label text-coral" role="status" aria-live="polite">
                {status ?? `${nodes.length} wishes so far — saved on this device`}
              </p>
              {wishes.length > SEEDS.length && (
                <button
                  type="button"
                  onClick={reset}
                  className="label border border-ink/40 px-3 py-1.5 text-ink transition-colors hover:border-coral hover:bg-coral hover:text-paper"
                  style={{ fontSize: 10 }}
                >
                  RESET
                </button>
              )}
            </div>
          </div>

          {/* right: the constellation */}
          <div className="relative min-h-0 flex-1 px-6 pb-8 pt-6 md:px-0 md:pb-0 md:pt-0">
            <svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              className="h-full max-h-[52vh] w-full md:max-h-[86vh]"
              fill="none"
              aria-hidden="true"
            >
              {/* connecting lines, drawn in sequence */}
              {nodes.slice(1).map((n, i) => {
                const prev = nodes[i]
                const isFresh = fresh.current.has(n.id)
                const from = 0.14 + (i / Math.max(nodes.length, 4)) * 0.6
                return (
                  <line
                    key={`l-${n.id}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={n.x}
                    y2={n.y}
                    stroke="#2B4FE0"
                    strokeWidth="1.4"
                    opacity="0.75"
                    pathLength={1}
                    strokeDasharray={1}
                    className={isFresh && !compact ? 'anim-draw' : undefined}
                    style={
                      compact
                        ? { strokeDashoffset: 0 }
                        : isFresh
                        ? ({ '--len': 1, '--dur': '900ms' } as CSSProperties)
                        : { strokeDashoffset: `calc(1 - ${seg(from, from + 0.12)})` }
                    }
                  />
                )
              })}

              {/* nodes + handwritten labels */}
              {nodes.map((n, i) => {
                const isFresh = fresh.current.has(n.id)
                const at = 0.1 + (i / Math.max(nodes.length, 4)) * 0.6
                const show = compact ? 1 : isFresh ? '1' : seg(at, at + 0.1)
                return (
                  <g key={n.id} style={{ opacity: show }}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.size}
                      fill={n.color}
                      stroke="#2B4FE0"
                      strokeWidth="1.6"
                      className={compact ? '' : 'anim-float'}
                      style={{ animationDelay: `${-(i % 5) * 1.3}s`, transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                    <text
                      x={n.x + n.size + 10}
                      y={n.y + 6}
                      fill="#2B4FE0"
                      style={{ fontFamily: 'var(--font-script)', fontSize: 30 }}
                    >
                      {n.text}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
