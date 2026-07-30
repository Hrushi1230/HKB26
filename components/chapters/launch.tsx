'use client'

import type { CSSProperties } from 'react'
import { seg, useMatchMedia, useScene, useScrollEngine } from '@/lib/scroll'

function getTrajectory(
  P0: { x: number; y: number },
  P2: { x: number; y: number },
  C: { x: number; y: number }
) {
  const D = { x: C.x - (P0.x + P2.x) / 2, y: C.y - (P0.y + P2.y) / 2 }
  const PATH = `M${P0.x} ${P0.y} Q${C.x} ${C.y} ${P2.x} ${P2.y}`

  const posX = `calc(${P0.x}px + var(--t) * ${P2.x - P0.x}px + 2 * var(--t) * (1 - var(--t)) * ${D.x}px)`
  const posY = `calc(${P0.y}px + var(--t) * ${P2.y - P0.y}px + 2 * var(--t) * (1 - var(--t)) * ${D.y}px)`
  const dX = `calc(${P2.x - P0.x} + 2 * (1 - 2 * var(--t)) * ${D.x})`
  const dY = `calc(${P2.y - P0.y} + 2 * (1 - 2 * var(--t)) * ${D.y})`

  return { PATH, posX, posY, dX, dY }
}

const DESKTOP_TRAJ = getTrajectory({ x: -40, y: 1040 }, { x: 1960, y: 40 }, { x: 1240, y: 690 })
const MOBILE_TRAJ = getTrajectory({ x: 960, y: 1040 }, { x: 960, y: 40 }, { x: 960, y: 540 })

const DESKTOP_TICKS = [
  { x: 161, y: 982, label: 'IGNITION', at: 0.08 },
  { x: 1100, y: 615, label: 'LIFT-OFF', at: 0.5 },
  { x: 1841, y: 142, label: 'ORBIT', at: 0.92, anchor: 'end' as const },
]

const MOBILE_TICKS = [
  { x: 960, y: 960, label: 'IGNITION', at: 0.08, anchor: 'middle' as const },
  { x: 960, y: 540, label: 'LIFT-OFF', at: 0.5, anchor: 'middle' as const },
  { x: 960, y: 140, label: 'ORBIT', at: 0.92, anchor: 'middle' as const },
]

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="0" cy="0" r="60" fill="#6FD8A8" />
      <circle cx="78" cy="-26" r="46" fill="#6FD8A8" />
      <circle cx="128" cy="14" r="52" fill="#6FD8A8" />
      <rect x="-60" y="0" width="190" height="66" fill="#6FD8A8" />
    </g>
  )
}

export function Launch({ onCue }: { onCue?: (kind: 'launch') => void }) {
  const compact = useMatchMedia('(max-width: 767px)')
  const engine = useScrollEngine()
  const ref = useScene<HTMLElement>({
    stages: [0.14],
    onStage: () => onCue?.('launch'),
  })

  const flight = seg(0.1, 0.94)
  const head = seg(0.02, 0.22)

  const { PATH, posX, posY, dX, dY } = compact ? MOBILE_TRAJ : DESKTOP_TRAJ
  const ticks = compact ? MOBILE_TICKS : DESKTOP_TICKS

  return (
    <section
      id="launch"
      ref={ref}
      className="scene h-[320vh]"
      style={{ '--static-p': 0.6 } as CSSProperties}
      aria-label="Chapter four — ready for take-off"
    >
      <div className="scene-pin">
        <div
          className="scene-stage"
          style={{ '--t': flight, '--head': head } as CSSProperties}
        >
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            {/* dashed guide + solid trail that draws with the climb */}
            <path d={PATH} stroke="#FF6B4A" strokeWidth="4" strokeDasharray="24 20" opacity="0.55" />
            <path
              d={PATH}
              stroke="#FF6B4A"
              strokeWidth="8"
              pathLength={1}
              strokeDasharray={1}
              style={{ strokeDashoffset: `calc(1 - var(--t))` }}
            />

            {ticks.map((t) => (
              <g key={t.label} style={{ opacity: `calc(0.3 + ${seg(t.at * 0.84, t.at * 0.84 + 0.06)} * 0.7)` }}>
                <line x1={t.x} y1={t.y} x2={t.x} y2={t.y + 34} stroke="#2B4FE0" strokeWidth="6" />
                <text
                  x={t.x}
                  y={t.y + 78}
                  textAnchor={t.anchor ?? 'start'}
                  fill="#2B4FE0"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 26, letterSpacing: '0.2em' }}
                >
                  {t.label}
                </text>
              </g>
            ))}

            {/* clouds, parallaxing past */}
            <g
              style={{
                transform: `translateY(calc(var(--t) * 260px))`,
                opacity: `calc(1 - var(--t) * 0.8)`,
              }}
            >
              {compact ? (
                <>
                  <Cloud x={650} y={820} s={0.8} />
                  <Cloud x={960} y={900} s={0.7} />
                  <Cloud x={1200} y={780} s={0.65} />
                </>
              ) : (
                <>
                  <Cloud x={300} y={760} s={1.06} />
                  <Cloud x={880} y={880} s={0.78} />
                  <Cloud x={1420} y={700} s={0.66} />
                </>
              )}
            </g>

            {/* rocket, angled to the tangent */}
            <g
              style={{
                transform: `translate(${posX}, ${posY})
                  rotate(calc(atan2(${dY}, ${dX}) + 90deg))
                  scale(calc((1 - var(--t) * 0.42) * ${compact ? 0.72 : 1}))`,
              }}
            >
              {/* exhaust plume, stretching with velocity */}
              <g
                style={{
                  transformOrigin: '0px 190px',
                  transform: `scaleY(calc(0.12 + ${seg(0.06, 0.3)} * 1.05))`,
                  opacity: seg(0.04, 0.16),
                }}
              >
                <path
                  d="M0 188 C 80 306 66 448 0 552 C -66 448 -80 306 0 188 Z"
                  fill="#FFB223"
                  className="anim-flicker"
                  style={{ transformOrigin: '0px 190px' }}
                />
                <path d="M0 198 C 46 292 38 398 0 470 C -38 398 -46 292 0 198 Z" fill="#FF6B4A" />
                <path d="M0 208 C 21 272 18 338 0 386 C -18 338 -21 272 0 208 Z" fill="#FFB223" />
              </g>

              {/* fins */}
              <path d="M-66 4 L-158 122 L-140 178 L-66 128 Z" fill="#2B4FE0" />
              <path d="M66 4 L158 122 L140 178 L66 128 Z" fill="#2B4FE0" />
              {/* nose cone */}
              <path d="M0 -298 C 52 -212 68 -146 68 -96 L-68 -96 C -68 -146 -52 -212 0 -298 Z" fill="#2B4FE0" />
              {/* body */}
              <path d="M-68 -78 L68 -78 L68 150 Q 68 172 46 172 L-46 172 Q -68 172 -68 150 Z" fill="#FF6B4A" />
              <line x1="-13" y1="58" x2="-13" y2="190" stroke="#2B4FE0" strokeWidth="8" />
              <line x1="13" y1="58" x2="13" y2="190" stroke="#2B4FE0" strokeWidth="8" />
              <rect x="-34" y="166" width="68" height="30" fill="#FF6B4A" />
              {/* porthole */}
              <circle cx="0" cy="-16" r="42" fill="none" stroke="#FFB223" strokeWidth="21" />
              <circle cx="0" cy="-16" r="26" fill="#FBF7F0" />
            </g>
          </svg>

          {/* chrome */}
          <p className="label absolute left-6 top-6 md:left-12 md:top-10">Chapter 04 — Launch</p>

          <h2
            className="display absolute bottom-24 left-6 text-ink md:bottom-28 md:left-12"
            style={{
              fontSize: 'clamp(2.8rem, 9.5vw, 9rem)',
              opacity: `calc(1 - ${seg(0.62, 0.9)})`,
            }}
          >
            {['Ready', 'For', 'Take-off'].map((word, i) => (
              <span
                key={word}
                className="block"
                style={{
                  clipPath: `inset(0 calc((1 - ${seg(0.02 + i * 0.05, 0.16 + i * 0.05)}) * 100%) 0 0)`,
                }}
              >
                {word}
              </span>
            ))}
          </h2>

          <p
            className="label absolute bottom-8 left-6 text-coral md:left-12"
            aria-live="polite"
            style={{ opacity: 'var(--head)' }}
          >
            Keep scrolling to climb
          </p>

          <button
            type="button"
            onClick={() => engine.scrollTo('#burst')}
            className="absolute bottom-8 right-6 bg-coral px-8 py-3.5 text-paper transition-transform hover:scale-[1.04] md:right-12"
            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.24em', fontSize: 12 }}
          >
            LAUNCH
          </button>
        </div>
      </div>
    </section>
  )
}
