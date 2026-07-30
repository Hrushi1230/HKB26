'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useScrollEngine } from '@/lib/scroll'

export const CHAPTERS = [
  { id: 'hero', num: '01', name: 'Twenty-Six' },
  { id: 'letter', num: '02', name: 'The Letter' },
  { id: 'orbits', num: '03', name: 'Orbits' },
  { id: 'launch', num: '04', name: 'Launch' },
  { id: 'burst', num: '05', name: 'The Burst' },
  { id: 'wishes', num: '06', name: 'Wishes' },
  { id: 'toast', num: '07', name: 'The Toast' },
]

export function ChapterRail({
  soundEnabled,
  onToggleSound,
}: {
  soundEnabled: boolean
  onToggleSound: () => void
}) {
  const engine = useScrollEngine()
  const [active, setActive] = useState(0)

  // Only fires on chapter change, so it costs nothing while scrubbing.
  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const i = CHAPTERS.findIndex((c) => c.id === entry.target.id)
          if (i >= 0) setActive(i)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const current = CHAPTERS[active]

  return (
    <nav
      aria-label="Chapters"
      className="fixed inset-x-0 top-0 z-40 flex items-center gap-3 border-b border-ink/15 bg-paper/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:inset-y-0 md:left-auto md:right-0 md:w-auto md:flex-col md:items-end md:justify-center md:gap-4 md:border-0 md:bg-transparent md:px-6 md:py-0"
    >
      <p className="label hidden whitespace-nowrap md:block" aria-hidden="true">
        {current.num} — {current.name}
      </p>
      <ol className="flex flex-1 items-center gap-2 md:flex-none md:flex-col md:items-end md:gap-3">
        {CHAPTERS.map((c, i) => (
          <li key={c.id} className="flex-1 md:flex-none">
            <button
              type="button"
              onClick={() => engine.scrollTo(`#${c.id}`)}
              aria-label={`Chapter ${c.num}: ${c.name}`}
              aria-current={i === active ? 'step' : undefined}
              className="group flex w-full items-center justify-end gap-2 py-1.5"
            >
              <span className="label hidden text-[10px] md:group-hover:inline">{c.name}</span>
              <span
                className="block h-[3px] w-full transition-all md:h-[2px] md:w-8"
                style={{
                  background: i === active ? '#FF6B4A' : '#2B4FE0',
                  opacity: i === active ? 1 : 0.3,
                  height: i === active ? 4 : undefined,
                }}
              />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundEnabled}
        className="flex h-8 w-8 items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper md:mt-4"
      >
        {soundEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
        <span className="sr-only">{soundEnabled ? 'Turn sound off' : 'Turn sound on'}</span>
      </button>
    </nav>
  )
}
