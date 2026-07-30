'use client'

import type { CSSProperties } from 'react'
import { quant } from '@/lib/geom'
import { seg, useScene } from '@/lib/scroll'

/* Concentric ellipses, one per milestone year. Dots travel their own
   ellipse as `--p` advances; labels are counter-positioned so they
   always read upright. */
const CX = 420
const CY = 380
const RINGS = [
  { rx: 118, ry: 74, year: '2000', from: -0.55, turns: 0.72, c: '#FF6B4A' },
  { rx: 190, ry: 118, year: '2008', from: 0.15, turns: 0.6, c: '#6FD8A8' },
  { rx: 262, ry: 162, year: '2015', from: 0.62, turns: 0.5, c: '#FFB223' },
  { rx: 336, ry: 208, year: '2021', from: -0.2, turns: 0.42, c: '#FF6B4A' },
]
const OUTER = { rx: 336, ry: 208 }

const THREAD =
  'M 96 -40 C 250 120 40 240 176 372 C 300 492 90 560 220 700 C 300 786 180 860 260 1000 C 300 1070 250 1110 300 1180'

export function Orbits() {
  const ref = useScene<HTMLElement>()

  const intro = seg(0, 0.2)
  const travel = seg(0.05, 0.92)
  const copy = seg(0.24, 0.44)

  return (
    <section
      id="orbits"
      ref={ref}
      className="scene h-[340vh]"
      style={{ '--static-p': 0.85 } as CSSProperties}
      aria-label="Chapter three — twenty-six trips around the sun"
    >
      <div className="scene-pin">
        <div
          className="scene-stage"
          style={
            {
              '--intro': intro,
              '--travel': travel,
              '--copy': copy,
            } as CSSProperties
          }
        >
          {/* looping thread down the frame */}
          <svg
            className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[26vw] md:block"
            viewBox="0 0 400 1180"
            preserveAspectRatio="xMinYMid slice"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={THREAD}
              stroke="#FF6B4A"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              style={{ strokeDashoffset: `calc(1 - var(--travel))` }}
            />
          </svg>

          <p className="label absolute left-5 top-[calc(4.75rem+env(safe-area-inset-top))] z-20 md:left-12 md:top-10">
            Chapter 03 — Orbits
          </p>

          {/* giant 26 bleeding off the left edge */}
          <p
            className="display pointer-events-none absolute -left-[12vw] top-[28%] -translate-y-1/2 text-coral md:-left-[4vw] md:top-1/2"
            style={{
              fontSize: 'clamp(16rem, 72vw, 34rem)',
              lineHeight: 0.8,
              opacity: 'calc(0.12 + var(--intro) * 0.88)',
              transform: `translateY(calc(-50% + (1 - var(--intro)) * 3rem))`,
            }}
            aria-hidden="true"
          >
            26
          </p>

          {/* orbit diagram */}
          <svg
            viewBox="0 0 840 760"
            className="absolute -right-[26vw] top-[57%] h-auto w-[126vw] -translate-y-1/2 md:right-0 md:top-1/2 md:w-[52vw]"
            fill="none"
            aria-hidden="true"
          >
            {RINGS.map((r, i) => (
              <ellipse
                key={r.year}
                cx={CX}
                cy={CY}
                rx={r.rx}
                ry={r.ry}
                stroke="#2B4FE0"
                strokeWidth="1.4"
                opacity="0.5"
                pathLength={1}
                strokeDasharray={1}
                style={{ strokeDashoffset: `calc(1 - ${seg(i * 0.04, 0.24 + i * 0.04)})` }}
              />
            ))}

            {/* the sun */}
            <g style={{ opacity: 'var(--intro)' }}>
              <circle cx={CX} cy={CY} r="46" fill="#FFB223" />
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i / 24) * Math.PI * 2
                const r1 = 56
                const r2 = i % 2 === 0 ? 82 : 70
                return (
                  <line
                    key={i}
                    x1={quant(CX + Math.cos(a) * r1)}
                    y1={quant(CY + Math.sin(a) * r1)}
                    x2={quant(CX + Math.cos(a) * r2)}
                    y2={quant(CY + Math.sin(a) * r2)}
                    stroke="#2B4FE0"
                    strokeWidth="2"
                  />
                )
              })}
            </g>

            {/* travelling year dots — parametric position from --travel */}
            {RINGS.map((r) => (
              <g
                key={`dot-${r.year}`}
                style={{
                  // sin/cos of the scroll angle, expressed with CSS trig
                  transform: `translate(
                    calc(cos((${r.from}turn) + var(--travel) * ${r.turns}turn) * ${r.rx}px),
                    calc(sin((${r.from}turn) + var(--travel) * ${r.turns}turn) * ${r.ry}px)
                  )`,
                  opacity: 'var(--intro)',
                }}
              >
                <circle cx={CX} cy={CY} r="13" fill={r.c} stroke="#2B4FE0" strokeWidth="1.6" />
                <text
                  x={CX}
                  y={CY - 26}
                  textAnchor="middle"
                  fill="#2B4FE0"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '0.14em' }}
                >
                  {r.year}
                </text>
              </g>
            ))}

            {/* today */}
            <g style={{ opacity: seg(0.6, 0.8) }}>
              <circle
                cx={CX + OUTER.rx}
                cy={CY}
                r="16"
                fill="#2B4FE0"
                stroke="#FBF7F0"
                strokeWidth="3"
              />
              <text
                x={CX + OUTER.rx}
                y={CY + 44}
                textAnchor="middle"
                fill="#2B4FE0"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: '0.14em' }}
              >
                2026
              </text>
            </g>
          </svg>

          {/* headline + two-column copy */}
          <div className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-5 right-5 md:bottom-16 md:left-12 md:right-auto md:max-w-[46vw]">
            <h2
              className="display text-ink"
              style={{
                fontSize: 'clamp(2.1rem, 5.4vw, 4.6rem)',
                clipPath: `inset(0 calc((1 - ${seg(0.16, 0.4)}) * 100%) 0 0)`,
              }}
            >
              26 Trips
              <br />
              Around the Sun
            </h2>
            <div
              className="mt-3 hidden gap-6 text-pretty text-sm leading-relaxed text-ink sm:block md:mt-6 md:columns-2"
              style={{
                opacity: 'var(--copy)',
                transform: `translateY(calc((1 - var(--copy)) * 1.5rem))`,
              }}
            >
              <p>
                Twenty-six laps around a very patient star. Somewhere in there: first steps, first
                code, first plans that actually worked.
              </p>
              <p className="mt-4 md:mt-0">
                Every ring here is a milestone still in motion — and the outermost one is today,
                bright and only just beginning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
