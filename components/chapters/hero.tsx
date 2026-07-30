'use client'

import type { CSSProperties } from 'react'
import { seg, useMatchMedia, useScene } from '@/lib/scroll'

const SQUIGGLE =
  'M -30 610 C 170 612 196 546 300 522 C 384 503 398 574 326 580 C 262 585 274 518 404 502 C 706 464 902 522 1104 470 C 1408 392 1506 482 1712 428 C 1812 402 1898 418 1960 396'

/** Entrance wrapper — plays once after the loader lifts, then hands the
 *  element over to the scroll-driven transform on its child. */
function Enter({
  delay,
  className = 'anim-rise',
  children,
}: {
  delay: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`await-ready ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export function Hero() {
  const isMobile = useMatchMedia('(max-width: 767px)')
  // Disable scroll-driven scrubbing on mobile to prevent scrolling lag
  const ref = useScene<HTMLElement>({ disabled: isMobile })

  const drift = isMobile ? 0 : seg(0, 0.78)
  const out = isMobile ? 0 : seg(0.8, 1)

  return (
    <section
      id="hero"
      ref={ref}
      className={`scene ${isMobile ? 'h-[100svh]' : 'h-[240vh]'}`}
      style={{ '--static-p': 0, '--drift': 0, '--out': 0 } as CSSProperties}
      aria-label="Chapter one — twenty-six"
    >
      <div className="scene-pin">
        <div
          className="scene-stage"
          style={
            {
              '--drift': drift,
              '--out': out,
              opacity: isMobile ? 1 : 'calc(1 - var(--out) * 0.92)',
            } as CSSProperties
          }
        >
          {/* hand-drawn thread */}
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            fill="none"
            aria-hidden="true"
            style={{ transform: isMobile ? 'none' : 'translateY(calc(var(--drift) * -5vh))' }}
          >
            <path
              d={SQUIGGLE}
              stroke="#FF6B4A"
              strokeWidth="3.4"
              strokeLinecap="round"
              className="await-ready anim-draw"
              style={{ '--len': 3400, '--dur': '2.6s' } as CSSProperties}
            />
          </svg>

          {/* floating props */}
          <div className="absolute left-[6%] top-[24%] md:left-[13%] md:top-[28%]" aria-hidden="true">
            <Enter delay={260} className="anim-pop">
              <div style={{ transform: isMobile ? 'none' : 'translateY(calc(var(--drift) * -12vh))' }}>
                <div className="anim-float" style={{ animationDelay: '-1.2s' }}>
                  <svg width="150" height="132" viewBox="0 0 150 132" fill="none">
                    <g transform="rotate(-16 75 66)">
                      <ellipse cx="77" cy="70" rx="60" ry="42" stroke="#F0A41C" strokeWidth="15" />
                      <ellipse cx="75" cy="65" rx="60" ry="42" stroke="#FFB223" strokeWidth="14" />
                    </g>
                  </svg>
                </div>
              </div>
            </Enter>
          </div>

          <div className="absolute right-[8%] top-[15%] md:right-[15%] md:top-[17%]" aria-hidden="true">
            <Enter delay={420} className="anim-pop">
              <div style={{ transform: isMobile ? 'rotate(-22deg)' : 'translateY(calc(var(--drift) * -17vh)) rotate(-22deg)' }}>
                <div className="anim-float" style={{ animationDelay: '-3.4s' }}>
                  <div className="h-[18px] w-[130px] border-b-[7px] border-b-[#4FBF8B] bg-mint md:h-[22px] md:w-[172px]" />
                </div>
              </div>
            </Enter>
          </div>

          <div className="absolute right-[10%] top-[56%] md:right-[9%] md:top-[54%]" aria-hidden="true">
            <Enter delay={560} className="anim-pop">
              <div style={{ transform: isMobile ? 'none' : 'translateY(calc(var(--drift) * -8vh))' }}>
                <div className="anim-float" style={{ animationDelay: '-2.1s' }}>
                  <svg width="86" height="86" viewBox="0 0 86 86" fill="none">
                    <circle cx="46" cy="46" r="34" fill="#E05334" />
                    <circle cx="42" cy="42" r="34" fill="#FF6B4A" />
                  </svg>
                </div>
              </div>
            </Enter>
          </div>

          {/* 26 sculpture */}
          <div
            className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 md:left-[58%] md:top-[44%]"
            aria-hidden="true"
          >
            <Enter delay={120} className="anim-pop">
              <div
                style={
                  isMobile
                    ? undefined
                    : {
                        transform:
                          'translateY(calc(var(--drift) * -9vh)) scale(calc(1 + var(--drift) * 0.06))',
                      }
                }
              >
                <div className="relative">
                  <div className="absolute left-1/2 top-full h-[3.5vw] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-paper-deep" />
                  <p
                    className="display relative flex leading-none"
                    style={{ fontSize: 'clamp(9rem, 28vw, 26rem)' }}
                  >
                    <span className="extrude-coral">2</span>
                    <span className="extrude-ink">6</span>
                  </p>
                </div>
              </div>
            </Enter>
          </div>

          {/* editorial furniture */}
          <div className="absolute left-6 top-6 max-w-[70%] md:left-12 md:top-10">
            <Enter delay={700} className="anim-fade">
              <p className="label">Chapter 01 — Twenty-Six Trips Around the Sun</p>
            </Enter>
          </div>

          <div className="absolute bottom-10 left-6 p-4 md:bottom-14 md:left-12 md:p-8 my-4">
            <Enter delay={620}>
              <h1
                className="display text-ink p-2 mb-3"
                style={{ fontSize: 'clamp(3.5rem, 9.5vw, 8.5rem)', lineHeight: 0.88 }}
              >
                Hrushikesh
                <br />
                Behera
              </h1>
            </Enter>
            <Enter delay={900} className="anim-grow">
              <div className="mt-7 h-[4px] w-[min(50vw,34rem)] origin-left bg-coral" />
            </Enter>
          </div>

          <p
            className="await-ready anim-fade label absolute bottom-8 right-6 md:right-20"
            style={
              isMobile
                ? { animationDelay: '1100ms', opacity: 1 }
                : {
                    animationDelay: '1100ms',
                    opacity: `calc(1 - ${seg(0, 0.12)})`,
                  }
            }
          >
            Scroll
          </p>
        </div>
      </div>
    </section>
  )
}
