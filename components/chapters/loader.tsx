'use client'

import { useEffect, useRef, useState } from 'react'

const COUNT = 26
const COLORS = ['#FF6B4A', '#2B4FE0', '#6FD8A8']

// Row geometry inside the SVG viewBox.
const VB_W = 1440
const VB_H = 440
const ROW_X = 30
const ROW_W = 1380
const CANDLE_W = 17
const BASE_Y = 372
const LIT_H = 268
const UNLIT_H = 216
const PITCH = (ROW_W - CANDLE_W) / (COUNT - 1)

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPct(100)
      setGone(true)
      doneRef.current()
      return
    }

    const DURATION = 2500
    let frame = 0
    let start = 0
    let exitTimer = 0
    let endTimer = 0

    const step = (t: number) => {
      if (!start) start = t
      const raw = Math.min(1, (t - start) / DURATION)
      setPct(Math.round(easeInOut(raw) * 100))
      if (raw < 1) {
        frame = requestAnimationFrame(step)
      } else {
        exitTimer = window.setTimeout(() => {
          setExiting(true)
          endTimer = window.setTimeout(() => {
            setGone(true)
            doneRef.current()
          }, 1000)
        }, 460)
      }
    }
    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(exitTimer)
      window.clearTimeout(endTimer)
    }
  }, [])

  if (gone) return null

  const lit = Math.round((pct / 100) * COUNT)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-paper px-6 py-6 md:px-12 md:py-10"
      style={{
        transform: exiting ? 'translateY(-101%)' : 'translateY(0)',
        transition: 'transform 1s cubic-bezier(0.76, 0, 0.24, 1)',
      }}
      role="progressbar"
      aria-label="Lighting the candles"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <p className="label">Lighting the candles</p>

      <div className="flex min-h-0 flex-1 items-center py-4">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-auto w-full"
          aria-hidden="true"
          fill="none"
        >
          <defs>
            {COLORS.map((c, i) => (
              <pattern
                key={c}
                id={`taper-${i}`}
                width="9"
                height="9"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(38)"
              >
                <rect width="9" height="9" fill={c} />
                <line x1="0" y1="0" x2="0" y2="9" stroke="#FBF7F0" strokeWidth="3.2" opacity="0.5" />
              </pattern>
            ))}
          </defs>

          {Array.from({ length: COUNT }).map((_, i) => {
            const isLit = i < lit
            const x = ROW_X + i * PITCH
            const cx = x + CANDLE_W / 2
            const h = isLit ? LIT_H : UNLIT_H
            const top = BASE_Y - h
            const flameTop = top - 15
            return (
              <g key={i}>
                {/* wick */}
                <line
                  x1={cx}
                  y1={top}
                  x2={cx}
                  y2={top - 13}
                  stroke="#2B4FE0"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                {/* flame */}
                {isLit && (
                  <g
                    className="anim-flicker"
                    style={{
                      transformOrigin: `${cx}px ${flameTop - 4}px`,
                      animationDelay: `${(i % 7) * 0.06}s`,
                    }}
                  >
                    <path
                      d={`M ${cx} ${flameTop - 40}
                          C ${cx + 13} ${flameTop - 16} ${cx + 11} ${flameTop} ${cx} ${flameTop}
                          C ${cx - 11} ${flameTop} ${cx - 13} ${flameTop - 16} ${cx} ${flameTop - 40} Z`}
                      fill="#FFB223"
                    />
                  </g>
                )}
                {/* taper */}
                <rect
                  x={x}
                  y={top}
                  width={CANDLE_W}
                  height={h}
                  fill={`url(#taper-${i % 3})`}
                  stroke="#2B4FE0"
                  strokeWidth="1.6"
                  style={{ transition: 'y 0.45s ease, height 0.45s ease' }}
                />
              </g>
            )
          })}

          {/* progress rule */}
          <line x1={ROW_X} y1={412} x2={ROW_X + ROW_W} y2={412} stroke="#FF6B4A" strokeWidth="1.6" />
          <line
            x1={ROW_X}
            y1={412}
            x2={ROW_X + (ROW_W * pct) / 100}
            y2={412}
            stroke="#FF6B4A"
            strokeWidth="7"
          />
        </svg>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="label pb-2 md:pb-4">Hrushikesh Behera — Twenty Six</p>
        <p className="display flex items-start leading-none text-ink">
          <span
            className="tabular-nums"
            style={{ fontSize: 'clamp(4.5rem, 15vw, 13rem)' }}
          >
            {pct}
          </span>
          <span className="text-coral" style={{ fontSize: 'clamp(1.6rem, 5vw, 4.2rem)' }}>
            %
          </span>
        </p>
      </div>
    </div>
  )
}
