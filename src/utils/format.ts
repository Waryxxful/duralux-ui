/**
 * Formatos de interfaz (REGLAS-DE-DISENO §8): porcentaje «84 %», fecha dd-mm-aaaa,
 * hora 24 h y tiempo relativo en español. Puros y deterministas (reciben `now`).
 */
const NBSP = ' '

/** Porcentaje entero con espacio duro: 84 → «84 %». */
export function formatPercent(value: number): string {
  const rounded = Number.isFinite(value) ? Math.round(value) : 0
  return `${rounded}${NBSP}%`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Convierte Date | ISO | epoch en Date válida, o null. */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

/** dd-mm-aaaa */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

/** HH:mm (24 h) */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** dd-mm-aaaa HH:mm */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

let relativeFormatter: Intl.RelativeTimeFormat | null = null

/** Tiempo relativo legible: «hace un momento», «hace 5 minutos», «ayer», «dentro de 2 horas». */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  if (Math.abs(seconds) < 45) return 'hace un momento'
  relativeFormatter ??= new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit)
  }
  return relativeFormatter.format(Math.round(seconds / 60), 'minute')
}
