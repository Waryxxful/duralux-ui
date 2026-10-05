/** Formatos de cifras del asistente (es-CL: punto de miles, coma decimal). */

/** «8 s», «1 min 05 s». */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0))
  if (s < 60) return `${s} s`
  const minutes = Math.floor(s / 60)
  const rest = String(s % 60).padStart(2, '0')
  return `${minutes} min ${rest} s`
}

/** Cuenta regresiva «4:05» o «1:04:05»: mismo formato que las duraciones de 2.7. */
export { formatDuration as formatCountdown } from '../../domain/internal/duration'

/** «840», «12,4 k», «128 k». */
export function formatTokens(n: number): string {
  const value = Number.isFinite(n) ? Math.max(0, n) : 0
  if (value < 1000) return value.toLocaleString('es-CL')
  return `${(value / 1000).toLocaleString('es-CL', { maximumFractionDigits: 1 })} k`
}

/** «US$ 0,0124». */
export function formatCost(usd: number): string {
  const value = Number.isFinite(usd) ? Math.max(0, usd) : 0
  return `US$ ${value.toLocaleString('es-CL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}

/** «12,5 %». */
export function formatPercent(value: number): string {
  return `${value.toLocaleString('es-CL', { maximumFractionDigits: 1 })} %`
}

export function clampPercent(used: number, limit: number): number {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return 100
  return Math.min(100, Math.max(0, (used / limit) * 100))
}
