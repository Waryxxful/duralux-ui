import { useEffect, useState } from 'react'
import { isFiniteNumber } from '../../../utils/typeGuards'

const TICK_MS = 1000

/**
 * Segundos transcurridos desde `startedAt` (o desde que `active` pasa a true).
 * Se recalcula contra el reloj en cada tic: no acumula deriva si el intervalo se atrasa.
 */
export function useElapsed(active = true, startedAt?: number): number {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!active) {
      setSeconds(0)
      return undefined
    }
    const origin = isFiniteNumber(startedAt) ? startedAt : Date.now()
    const update = () => setSeconds(Math.max(0, Math.floor((Date.now() - origin) / 1000)))
    update()
    const timer = setInterval(update, TICK_MS)
    return () => clearInterval(timer)
  }, [active, startedAt])
  return seconds
}

/** Cuenta regresiva en segundos desde `initialSeconds`; se reinicia si cambia el valor inicial. */
export function useCountdown(initialSeconds: number): number {
  const [left, setLeft] = useState(() => Math.max(0, Math.floor(initialSeconds)))
  useEffect(() => {
    const start = Date.now()
    const total = Math.max(0, Math.floor(Number.isFinite(initialSeconds) ? initialSeconds : 0))
    const update = () => setLeft(Math.max(0, total - Math.floor((Date.now() - start) / 1000)))
    update()
    if (total === 0) return undefined
    const timer = setInterval(update, TICK_MS)
    return () => clearInterval(timer)
  }, [initialSeconds])
  return left
}
