'use client'

import { useState } from 'react'
import { ChapterRail } from '@/components/chapter-rail'
import { Burst } from '@/components/chapters/burst'
import { Hero } from '@/components/chapters/hero'
import { Launch } from '@/components/chapters/launch'
import { Letter } from '@/components/chapters/letter'
import { Loader } from '@/components/chapters/loader'
import { Orbits } from '@/components/chapters/orbits'
import { Toast } from '@/components/chapters/toast'
import { Wishes } from '@/components/chapters/wishes'
import { FilmGrain } from '@/components/film-grain'
import { ScrollProvider } from '@/lib/scroll'
import { useAmbientAudio } from '@/lib/use-ambient-audio'

export function Journey() {
  const [ready, setReady] = useState(false)
  const { enabled, toggle, cue } = useAmbientAudio()

  return (
    <ScrollProvider locked={!ready}>
      <FilmGrain />
      {!ready && <Loader onDone={() => setReady(true)} />}
      <ChapterRail soundEnabled={enabled} onToggleSound={toggle} />

      <main className="relative w-full">
        <Hero />
        <Letter onCue={cue} />
        <Orbits />
        <Launch onCue={cue} />
        <Burst onCue={cue} />
        <Wishes onCue={cue} />
        <Toast soundEnabled={enabled} onToggleSound={toggle} onCue={cue} />
      </main>
    </ScrollProvider>
  )
}
