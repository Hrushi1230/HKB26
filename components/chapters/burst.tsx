'use client'

import type { CSSProperties } from 'react'
import { quant } from '@/lib/geom'
import { seg, useScene } from '@/lib/scroll'

const DOT_COLORS = ['#FFB223', '#6FD8A8']

/** Starburst whose rays grow out of the core as its window of `--p` passes. */
function Firework({
  rays,
  size,
  from,
  to,
  varName,
}: {
  rays: number
  size: number
  from: number
  to: number
  varName: string
}) {
  const c = size / 2
  const hub = size * 0.055
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="h-auto w-full overflow-visible"
      style={{ [varName]: seg(from, to) } as CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2 - Math.PI / 2
        const len = c * (i % 3 === 0 ? 0.94 : i % 3 === 1 ? 0.82 : 0.88)
        const x1 = quant(c + Math.cos(a) * hub)
        const y1 = quant(c + Math.sin(a) * hub)
        const x2 = quant(c + Math.cos(a) * len)
        const y2 = quant(c + Math.sin(a) * len)
        const stagger = i / rays / 3
        const w = `clamp(0, (var(${varName}) - ${stagger.toFixed(3)}) / 0.34, 1)`
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#2B4FE0"
              strokeWidth={Math.max(1.2, size * 0.004)}
              pathLength={1}
              strokeDasharray={1}
              style={{ strokeDashoffset: `calc(1 - ${w})` }}
            />
            <circle
              cx={x2}
              cy={y2}
              r={size * 0.021}
              fill={DOT_COLORS[i % 2]}
              style={{ opacity: `calc(${w} * ${w})` }}
            />
          </g>
        )
      })}
      <circle
        cx={c}
        cy={c}
        r={hub}
        fill="#FF6B4A"
        stroke="#2B4FE0"
        strokeWidth={Math.max(1.2, size * 0.004)}
        style={{ transform: `scale(calc(0.2 + var(${varName}) * 0.8))`, transformOrigin: 'center' }}
      />
    </svg>
  )
}

const SHAPES = [
  { t: 'rect', x: '6%', y: '13%', c: '#FF6B4A', r: -14, w: 46, h: 72 },
  { t: 'tri', x: '14%', y: '28%', c: '#FFB223', r: 8, w: 54, h: 54 },
  { t: 'rect', x: '4%', y: '46%', c: '#6FD8A8', r: 12, w: 42, h: 74 },
  { t: 'arc', x: '5%', y: '67%', c: '#FF6B4A', r: -6, w: 66, h: 66 },
  { t: 'rect', x: '8%', y: '85%', c: '#FFB223', r: 18, w: 64, h: 42 },
  { t: 'arc', x: '20%', y: '10%', c: '#6FD8A8', r: 22, w: 60, h: 60 },
  { t: 'tri', x: '18%', y: '77%', c: '#FF6B4A', r: -10, w: 48, h: 48 },
  { t: 'rect', x: '78%', y: '10%', c: '#FFB223', r: -8, w: 72, h: 46 },
  { t: 'tri', x: '92%', y: '18%', c: '#6FD8A8', r: 14, w: 58, h: 58 },
  { t: 'arc', x: '85%', y: '38%', c: '#FF6B4A', r: -18, w: 70, h: 70 },
  { t: 'rect', x: '94%', y: '57%', c: '#6FD8A8', r: 10, w: 44, h: 76 },
  { t: 'tri', x: '86%', y: '73%', c: '#FFB223', r: -12, w: 46, h: 46 },
  { t: 'rect', x: '90%', y: '88%', c: '#FF6B4A', r: 16, w: 64, h: 46 },
  { t: 'arc', x: '76%', y: '95%', c: '#6FD8A8', r: 26, w: 58, h: 58 },
]

function Shape({ t, c, w, h }: { t: string; c: string; w: number; h: number }) {
  if (t === 'tri')
    return (
      <svg width={w} height={h} viewBox="0 0 60 60" aria-hidden="true">
        <path d="M30 4 L58 54 L2 54 Z" fill={c} stroke="#2B4FE0" strokeWidth="2" />
      </svg>
    )
  if (t === 'arc')
    return (
      <svg width={w} height={h} viewBox="0 0 80 80" aria-hidden="true">
        <path d="M6 74 A 68 68 0 0 1 74 6 L74 34 A 40 40 0 0 0 34 74 Z" fill={c} stroke="#2B4FE0" strokeWidth="2" />
      </svg>
    )
  return <div style={{ width: w, height: h, background: c, border: '2px solid #2B4FE0' }} aria-hidden="true" />
}

export function Burst({ onCue }: { onCue?: (kind: 'burst') => void }) {
  const ref = useScene<HTMLElement>({
    stages: [0.16, 0.3, 0.42],
    onStage: () => onCue?.('burst'),
  })

  const title = seg(0.42, 0.6)

  return (
    <section
      id="burst"
      ref={ref}
      className="scene h-[300vh]"
      style={{ '--static-p': 0.75 } as CSSProperties}
      aria-label="Chapter five — the burst"
    >
      <div className="scene-pin">
        <div className="scene-stage" style={{ '--title': title } as CSSProperties}>
          <p className="label absolute left-6 top-6 z-20 md:left-12 md:top-10">
            Chapter 05 — The Burst
          </p>

          {/* drifting border shapes */}
          {SHAPES.map((s, i) => (
            <div
              key={i}
              className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
              style={{
                left: s.x,
                top: s.y,
                opacity: seg(0.2 + i * 0.015, 0.34 + i * 0.015),
                transform: `translate(-50%, -50%)
                  translateY(calc((1 - ${seg(0.2 + i * 0.015, 0.5)}) * 2.2rem))
                  rotate(calc(${seg(0.2 + i * 0.015, 0.8)} * ${s.r}deg))`,
              }}
            >
              <Shape t={s.t} c={s.c} w={s.w} h={s.h} />
            </div>
          ))}

          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-6">
            <div className="flex w-full max-w-5xl items-center justify-center gap-3 md:gap-8">
              <div className="hidden w-[14%] translate-y-10 md:block">
                <Firework rays={18} size={150} from={0.22} to={0.52} varName="--f2" />
              </div>
              <div className="w-[62%] max-w-[320px] md:w-[30%]">
                <Firework rays={28} size={300} from={0.08} to={0.42} varName="--f1" />
              </div>
              <div className="hidden w-[12%] translate-y-14 md:block">
                <Firework rays={16} size={120} from={0.3} to={0.58} varName="--f3" />
              </div>
            </div>

            <h2
              className="display mt-6 text-balance text-center text-coral"
              style={{
                fontSize: 'clamp(3rem, 11vw, 10rem)',
                opacity: 'var(--title)',
                transform: `translateY(calc((1 - var(--title)) * 2rem))`,
              }}
            >
              Let&apos;s Celebrate
            </h2>
            <div
              className="mt-4 h-[3px] max-w-[820px] bg-coral"
              style={{ width: `calc(${seg(0.5, 0.7)} * 70%)` }}
              aria-hidden="true"
            />
            <p
              className="label mt-4 text-center"
              style={{ letterSpacing: '0.3em', opacity: seg(0.56, 0.72) }}
            >
              26 Years of Hrushikesh Behera
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
