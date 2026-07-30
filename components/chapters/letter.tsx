'use client'

import { useState, type CSSProperties } from 'react'
import { quant } from '@/lib/geom'
import { seg, useMatchMedia, useScene, useScrollEngine } from '@/lib/scroll'

/* ── Wax seal geometry ────────────────────────────────────────────
   A 24-point jagged disc, then sliced into 9 irregular wedges that
   fly apart independently once the seal cracks.
   ─────────────────────────────────────────────────────────────── */
const SEAL_R = [52, 45]
const POINTS = 24

function pt(i: number) {
  const a = (i / POINTS) * Math.PI * 2 - Math.PI / 2
  const r = SEAL_R[i % 2]
  return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r] as const
}

const SEAL_PATH =
  Array.from({ length: POINTS }, (_, i) => {
    const [x, y] = pt(i)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ') + ' Z'

const SHARDS = Array.from({ length: 9 }, (_, k) => {
  const from = Math.round((k * POINTS) / 9)
  const to = Math.round(((k + 1) * POINTS) / 9)
  let d = 'M60 60'
  for (let i = from; i <= to; i++) {
    const [x, y] = pt(i % POINTS)
    d += ` L${x.toFixed(2)} ${y.toFixed(2)}`
  }
  const a = ((from + to) / 2 / POINTS) * Math.PI * 2 - Math.PI / 2
  return {
    d: `${d} Z`,
    dx: +(Math.cos(a) * (150 + ((k * 37) % 90))).toFixed(1),
    dy: +(Math.sin(a) * (120 + ((k * 53) % 80)) - 40).toFixed(1),
    rot: ((k % 2 === 0 ? 1 : -1) * (110 + ((k * 71) % 220))).toFixed(0),
  }
})

/** Hairline cracks that stroke themselves in just before the shatter. */
const CRACKS = [
  'M60 60 L26 30',
  'M60 60 L96 34',
  'M60 60 L100 78',
  'M60 60 L58 104',
  'M60 60 L22 82',
]

const CARD_LINES = [
  { from: 0.78, to: 0.83 },
  { from: 0.82, to: 0.87 },
  { from: 0.86, to: 0.92 },
  { from: 0.9, to: 0.96 },
]

const BURST_CONFETTI = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2 + (i % 3) * 0.15
  const dist = 140 + (i % 4) * 45
  return {
    dx: +(Math.cos(angle) * dist).toFixed(1),
    dy: +(Math.sin(angle) * dist * 0.65 - 40).toFixed(1),
    rot: (i % 2 === 0 ? 1 : -1) * (180 + i * 42),
    color: ['#FF6B4A', '#FFB223', '#6FD8A8', '#2B4FE0'][i % 4],
    size: 7 + (i % 3) * 3,
  }
})

const CHIPS = [
  { x: '8%', y: '20%', c: '#6FD8A8', r: -18 },
  { x: '15%', y: '44%', c: '#FFB223', r: 12 },
  { x: '7%', y: '68%', c: '#6FD8A8', r: 24 },
  { x: '19%', y: '84%', c: '#FFB223', r: -8 },
  { x: '85%', y: '18%', c: '#FFB223', r: 16 },
  { x: '91%', y: '40%', c: '#6FD8A8', r: -14 },
  { x: '83%', y: '62%', c: '#FFB223', r: 20 },
  { x: '89%', y: '80%', c: '#6FD8A8', r: -22 },
]

export function Letter({ onCue }: { onCue?: (kind: 'seal' | 'tick') => void }) {
  const compact = useMatchMedia('(max-width: 767px)')
  const engine = useScrollEngine()
  const [tapped, setTapped] = useState(false)

  const ref = useScene<HTMLElement>({
    disabled: compact,
    stages: [0.36, 0.52, 0.72],
    onStage: (i) => onCue?.(i === 0 ? 'seal' : 'tick'),
  })

  const s1 = seg(0, 0.2) // fly in from depth
  const s2 = seg(0.2, 0.35) // push toward the seal
  const s3 = seg(0.35, 0.5) // shatter
  const s4 = seg(0.5, 0.7) // flap opens
  const s5 = seg(0.7, 1) // card rises, camera fills frame

  const unseal = () => {
    if (tapped) return
    setTapped(true)
    onCue?.('seal')
  }

  return (
    <section
      id="letter"
      ref={ref}
      className={`scene ${compact ? 'min-h-[100svh]' : 'h-[420vh]'}`}
      style={
        {
          '--static-p': 0.95,
          ...(compact ? { '--p': tapped ? 1 : 0 } : null),
        } as CSSProperties
      }
      aria-label="Chapter two — the letter"
    >
      <div
        className={`stage-3d ${compact ? 'relative h-[100svh] min-h-[42rem] overflow-hidden' : 'scene-pin'} ${
          compact ? 'scene-tap' : ''
        }`}
      >
        <div
          className={compact ? 'relative h-full w-full' : 'scene-stage'}
          style={
            {
              '--s1': s1,
              '--s2': s2,
              '--s3': s3,
              '--s4': s4,
              '--s5': s5,
            } as CSSProperties
          }
        >
          <p className="label absolute left-5 top-[calc(4.75rem+env(safe-area-inset-top))] z-20 md:left-12 md:top-10">
            Chapter 02 — The Letter
          </p>

          {/* dashed approach path */}
          <svg
            className="pointer-events-none absolute left-0 top-[54%] hidden w-[46%] md:block"
            viewBox="0 0 600 200"
            fill="none"
            aria-hidden="true"
            style={{ opacity: `calc(var(--s1) * (1 - var(--s4)))` }}
          >
            <path
              d="M0 170 C 120 170 150 40 260 40 C 360 40 400 120 600 120"
              stroke="#2B4FE0"
              strokeWidth="3"
              strokeDasharray="14 14"
            />
          </svg>

          {/* OPEN ME */}
          <h2
            className="display pointer-events-none absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 text-ink md:left-12 md:block"
            style={{
              fontSize: 'clamp(3rem, 7.5vw, 7rem)',
              transform: `translateY(-50%) translateX(calc((1 - var(--s1)) * -6rem - var(--s2) * 10rem))`,
              opacity: `calc(var(--s1) * (1 - ${seg(0.2, 0.32)}))`,
            }}
          >
            Open
            <br />
            Me
          </h2>

          {compact && (
            <div className="absolute inset-x-5 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center">
              {!tapped ? (
                <button
                  type="button"
                  onClick={unseal}
                  className="label min-h-12 border-2 border-ink bg-paper px-6 py-3 text-ink transition-colors active:bg-ink active:text-paper"
                >
                  Tap to unseal
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => engine.scrollTo('#orbits')}
                  className="label min-h-12 border-2 border-ink bg-paper px-7 py-3 text-ink transition-colors active:bg-ink active:text-paper"
                  style={{ opacity: seg(0.9, 0.98), transform: `translateY(calc((1 - ${seg(0.9, 0.98)}) * 1rem))` }}
                >
                  Continue to orbits
                </button>
              )}
            </div>
          )}

          {/* ── camera ── */}
          <div
            className="absolute left-1/2 top-1/2 preserve-3d"
            style={{
              width: compact ? 'min(88vw, 31rem)' : 'min(66vw, 40rem)',
              containerType: 'inline-size',
              transform: compact
                ? `translate(-50%, -43%) translateY(calc(var(--s2) * 2% + var(--s4) * 6% + var(--s5) * 32%)) scale(calc(0.82 + var(--s2) * 0.12 + var(--s5) * 0.12))`
                : `translate(-50%, -46%) translateY(calc(var(--s2) * 2% + var(--s4) * 6% + var(--s5) * 42%)) scale(calc(0.9 + var(--s2) * 0.12 - var(--s5) * 0.04))`,
            }}
          >
            {/* ── envelope, rotating up out of depth ── */}
            <div
              className="relative preserve-3d"
              style={{
                transform: compact
                  ? `rotateX(calc(var(--s5) * -4deg)) rotateZ(calc((1 - var(--s1)) * -2deg))`
                  : `translateZ(calc((1 - var(--s1)) * -880px)) rotateX(calc((1 - var(--s1)) * 55deg + var(--s5) * -6deg)) rotateZ(calc((1 - var(--s1)) * -8deg))`,
                opacity: compact ? 1 : `calc(0.15 + var(--s1) * 0.85)`,
              }}
            >
              {/* offset backing plate */}
              <div
                className="absolute left-[0.9cqw] top-[0.9cqw] h-full w-full bg-ink"
                aria-hidden="true"
              />

              {/* the card that rises out of the pocket */}
              <div
                className="absolute inset-x-[6%] bottom-[12%] z-[1] origin-bottom"
                style={{
                  transform: compact
                    ? `translateY(calc(6% - var(--s5) * 46%)) rotate(calc(var(--s5) * -1.2deg))`
                    : `translateY(calc(6% - var(--s5) * 56%)) rotate(calc(var(--s5) * -1.2deg))`,
                  opacity: `calc(${seg(0.68, 0.76)})`,
                }}
                aria-hidden="true"
              >
                <div className="border-2 border-coral bg-card text-center" style={{ padding: '5cqw 5cqw 6cqw' }}>
                  {/* sun motif */}
                  <svg
                    viewBox="0 0 120 120"
                    className="mx-auto"
                    style={{ width: '14cqw', height: '14cqw', opacity: `calc(${CARD_LINES[0].from ? seg(0.74, 0.8) : 1})` }}
                  >
                    <circle cx="60" cy="60" r="17" fill="#FFB223" />
                    {Array.from({ length: 20 }).map((_, i) => {
                      const a = (i / 20) * Math.PI * 2
                      const r1 = 26
                      const r2 = i % 2 === 0 ? 50 : 42
                      return (
                        <line
                          key={i}
                          x1={quant(60 + Math.cos(a) * r1)}
                          y1={quant(60 + Math.sin(a) * r1)}
                          x2={quant(60 + Math.cos(a) * r2)}
                          y2={quant(60 + Math.sin(a) * r2)}
                          stroke="#2B4FE0"
                          strokeWidth="2"
                        />
                      )
                    })}
                  </svg>

                  <h3
                    className="display leading-[0.86] text-ink"
                    style={{
                      fontSize: '15cqw',
                      marginTop: '3cqw',
                      opacity: seg(CARD_LINES[0].from, CARD_LINES[0].to),
                      transform: `translateY(calc((1 - ${seg(CARD_LINES[0].from, CARD_LINES[0].to)}) * 1.4cqw))`,
                    }}
                  >
                    Happy
                    <br />
                    Birthday
                  </h3>
                  <p
                    className="text-coral"
                    style={{
                      fontFamily: 'var(--font-script)',
                      fontSize: '12cqw',
                      marginTop: '1.5cqw',
                      opacity: seg(CARD_LINES[1].from, CARD_LINES[1].to),
                    }}
                  >
                    Hrushikesh
                  </p>
                  <p
                    className="mx-auto max-w-[32ch] text-pretty leading-relaxed text-ink"
                    style={{
                      fontSize: '3.5cqw',
                      marginTop: '4cqw',
                      opacity: seg(CARD_LINES[2].from, CARD_LINES[2].to),
                    }}
                  >
                    Wishing you a day filled with joy, laughter and unforgettable moments. May the year
                    ahead bring you success, adventure and happiness.
                  </p>
                  <p
                    className="text-ink"
                    style={{
                      fontSize: '3cqw',
                      marginTop: '4cqw',
                      opacity: seg(CARD_LINES[3].from, CARD_LINES[3].to),
                    }}
                  >
                    — With best wishes
                  </p>
                </div>
              </div>

              {/* envelope body */}
              <svg viewBox="0 0 560 380" className="relative z-[2] w-full" aria-hidden="true">
                <rect x="2" y="2" width="556" height="376" fill="#FF6B4A" stroke="#2B4FE0" strokeWidth="3" />
                <path d="M2 2 L280 200 L2 378 Z" fill="#FF6B4A" stroke="#2B4FE0" strokeWidth="3" />
                <path d="M558 2 L280 200 L558 378 Z" fill="#FF6B4A" stroke="#2B4FE0" strokeWidth="3" />
                <path d="M2 378 L280 178 L558 378 Z" fill="#FF6B4A" stroke="#2B4FE0" strokeWidth="3" />
                <path
                  d="M2 378 L280 178 L558 378 Z"
                  fill="#FFB223"
                  stroke="#2B4FE0"
                  strokeWidth="3"
                  style={{ opacity: seg(0.56, 0.7) }}
                />
              </svg>

              {/* top flap on a true rotateX hinge */}
              <div
                className="absolute inset-x-0 top-0 origin-top preserve-3d"
                style={{
                  transform: `rotateX(calc(var(--s4) * -172deg))`,
                  zIndex: `calc(3 - var(--s4) * 3)`,
                }}
                aria-hidden="true"
              >
                {/* front face */}
                <svg viewBox="0 0 560 210" className="w-full backface-hidden">
                  <path d="M2 2 L558 2 L280 205 Z" fill="#FF6B4A" stroke="#2B4FE0" strokeWidth="3" />
                </svg>
                {/* back face (amber) */}
                <svg
                  viewBox="0 0 560 210"
                  className="absolute inset-0 w-full backface-hidden"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <path d="M2 2 L558 2 L280 205 Z" fill="#FFB223" stroke="#2B4FE0" strokeWidth="3" />
                </svg>
              </div>

              {/* wax seal + shards */}
              <div
                className="absolute left-1/2 top-[52%] z-[4] -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `translate(-50%,-50%) scale(calc(1 + var(--s2) * 0.5))`,
                }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 120 120"
                  className="overflow-visible"
                  style={{ width: '22cqw', height: '22cqw' }}
                >
                  {/* intact seal */}
                  <g style={{ opacity: `calc(1 - ${seg(0.35, 0.4)})` }}>
                    <path d={SEAL_PATH} fill="#6FD8A8" stroke="#2B4FE0" strokeWidth="1.5" />
                    <circle cx="60" cy="60" r="33" fill="none" stroke="#2B4FE0" strokeWidth="2" />
                    <text
                      x="60"
                      y="60"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#2B4FE0"
                      style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}
                    >
                      26
                    </text>
                    {CRACKS.map((d, i) => (
                      <path
                        key={d}
                        d={d}
                        stroke="#2B4FE0"
                        strokeWidth="1"
                        fill="none"
                        pathLength={1}
                        strokeDasharray={1}
                        style={{ strokeDashoffset: `calc(1 - ${seg(0.26 + i * 0.015, 0.36)})` }}
                      />
                    ))}
                  </g>

                  {/* shards */}
                  {SHARDS.map((s, i) => (
                    <path
                      key={i}
                      d={s.d}
                      fill="#6FD8A8"
                      stroke="#2B4FE0"
                      strokeWidth="1.2"
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'center',
                        opacity: `calc(${seg(0.35, 0.38)} * (1 - ${seg(0.44, 0.5)}))`,
                        transform: `translate(calc(var(--s3) * ${s.dx}px), calc(var(--s3) * ${s.dy}px))
                          rotate(calc(var(--s3) * ${s.rot}deg))
                          scale(calc(1 - var(--s3) * 0.35))`,
                      }}
                    />
                  ))}
                  </svg>
              </div>
              {/* celebratory confetti burst on open */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
                {BURST_CONFETTI.map((p, i) => {
                  const show = seg(0.48, 0.65)
                  const hide = seg(0.85, 0.95)
                  return (
                    <span
                      key={i}
                      className="absolute"
                      style={{
                        width: `${p.size}px`,
                        height: `${p.size * 1.5}px`,
                        backgroundColor: p.color,
                        opacity: `calc(${show} * (1 - ${hide}))`,
                        transform: `translate(calc(var(--s4) * ${p.dx}px), calc(var(--s4) * ${p.dy}px)) rotate(calc(var(--s4) * ${p.rot}deg)) scale(calc(var(--s4) * 1.2))`,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* confetti margins */}
          {CHIPS.map((chip, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute hidden h-6 w-4 md:block"
              style={{
                left: chip.x,
                top: chip.y,
                background: chip.c,
                opacity: seg(0.72 + i * 0.01, 0.82 + i * 0.01),
                transform: `translateY(calc((1 - ${seg(0.72 + i * 0.01, 0.9)}) * 3rem)) rotate(${chip.r}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
