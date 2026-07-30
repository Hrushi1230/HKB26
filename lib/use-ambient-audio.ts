'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Ctx = AudioContext & { __v0?: boolean }

/**
 * Generative ambient soundscape + one-shot cues, built entirely with the
 * Web Audio API so no external audio asset is required.
 * Off by default; only starts after an explicit user gesture.
 */
export function useAmbientAudio() {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<Ctx | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const padRef = useRef<{ stop: () => void } | null>(null)
  const timerRef = useRef<number | null>(null)

  const ensureCtx = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      const ctx = new AC() as Ctx
      const master = ctx.createGain()
      master.gain.value = 0
      master.connect(ctx.destination)
      ctxRef.current = ctx
      masterRef.current = master
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
    return ctxRef.current
  }, [])

  const startPad = useCallback(() => {
    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master || padRef.current) return

    // Warm, slow-moving chord — no samples, all oscillators.
    const chord = [130.81, 196.0, 261.63, 329.63] // C3 G3 C4 E4
    const nodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode }[] = []

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      osc.detune.value = (i - 1.5) * 4

      const gain = ctx.createGain()
      gain.gain.value = 0.0001

      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.045 + i * 0.021
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.035
      lfo.connect(lfoGain).connect(gain.gain)

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 900

      osc.connect(gain).connect(filter).connect(master)
      osc.start()
      lfo.start()
      gain.gain.setTargetAtTime(0.05, ctx.currentTime, 3)
      nodes.push({ osc, gain, lfo })
    })

    padRef.current = {
      stop: () => {
        nodes.forEach(({ osc, gain, lfo }) => {
          gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4)
          setTimeout(() => {
            try {
              osc.stop()
              lfo.stop()
            } catch {}
          }, 1400)
        })
      },
    }

    // Sparse bell motif drifting over the pad.
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0]
    const ping = () => {
      const c = ctxRef.current
      const m = masterRef.current
      if (!c || !m) return
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = scale[Math.floor(Math.random() * scale.length)]
      g.gain.value = 0
      g.gain.setValueAtTime(0, c.currentTime)
      g.gain.linearRampToValueAtTime(0.07, c.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3.2)
      osc.connect(g).connect(m)
      osc.start()
      osc.stop(c.currentTime + 3.4)
      timerRef.current = window.setTimeout(ping, 2600 + Math.random() * 4200)
    }
    timerRef.current = window.setTimeout(ping, 1800)
  }, [])

  const toggle = useCallback(() => {
    const ctx = ensureCtx()
    if (!ctx || !masterRef.current) return
    const next = !enabled
    setEnabled(next)
    masterRef.current.gain.setTargetAtTime(next ? 0.5 : 0, ctx.currentTime, 0.5)
    if (next) startPad()
    else {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
      padRef.current?.stop()
      padRef.current = null
    }
  }, [enabled, ensureCtx, startPad])

  /** Short interaction cues: seal break, ignition whoosh, burst, candle puff. */
  const cue = useCallback(
    (kind: 'seal' | 'launch' | 'burst' | 'puff' | 'tick') => {
      if (!enabled) return
      const ctx = ctxRef.current
      const master = masterRef.current
      if (!ctx || !master) return
      const t = ctx.currentTime

      if (kind === 'seal') {
        // Crisp wax crack snap (pitch drop + noise friction)
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(840, t)
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.14)
        g.gain.setValueAtTime(0.25, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
        osc.connect(g).connect(master)
        osc.start(t)
        osc.stop(t + 0.18)

        // Paper rustle overlay
        const bufLen = ctx.sampleRate * 0.22
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
        const d = buffer.getChannelData(0)
        for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
        const src = ctx.createBufferSource()
        src.buffer = buffer
        const f = ctx.createBiquadFilter()
        f.type = 'highpass'
        f.frequency.value = 2200
        const fg = ctx.createGain()
        fg.gain.setValueAtTime(0.2, t)
        fg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
        src.connect(f).connect(fg).connect(master)
        src.start(t)
        return
      }

      if (kind === 'tick') {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(880, t)
        osc.frequency.exponentialRampToValueAtTime(660, t + 0.18)
        g.gain.setValueAtTime(0.16, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
        osc.connect(g).connect(master)
        osc.start(t)
        osc.stop(t + 0.32)
        return
      }

      // Noise-based cues
      const dur = kind === 'launch' ? 2.2 : kind === 'burst' ? 1.1 : 0.7
      const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        const decay = 1 - i / data.length
        data[i] = (Math.random() * 2 - 1) * decay * decay
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = kind === 'puff' ? 'bandpass' : 'lowpass'
      filter.frequency.setValueAtTime(kind === 'launch' ? 420 : 1400, t)
      if (kind === 'launch') filter.frequency.exponentialRampToValueAtTime(2400, t + dur)
      const g = ctx.createGain()
      g.gain.setValueAtTime(kind === 'burst' ? 0.3 : 0.2, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      src.connect(filter).connect(g).connect(master)
      src.start(t)

      if (kind === 'burst') {
        ;[659.25, 830.61, 987.77].forEach((f, i) => {
          const o = ctx.createOscillator()
          const og = ctx.createGain()
          o.type = 'sine'
          o.frequency.value = f
          og.gain.setValueAtTime(0, t + i * 0.09)
          og.gain.linearRampToValueAtTime(0.12, t + i * 0.09 + 0.02)
          og.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 1.4)
          o.connect(og).connect(master)
          o.start(t + i * 0.09)
          o.stop(t + i * 0.09 + 1.5)
        })
      }
    },
    [enabled],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      padRef.current?.stop()
      const ctx = ctxRef.current
      ctxRef.current = null
      masterRef.current = null
      setTimeout(() => {
        try {
          void ctx?.close()
        } catch {}
      }, 200)
    }
  }, [])

  return { enabled, toggle, cue }
}
