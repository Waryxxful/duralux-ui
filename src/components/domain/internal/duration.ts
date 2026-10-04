/**
 * Duraciones de contact center (REGLAS-DE-DISENO §8): «m:ss» y, desde una hora, «h:mm:ss».
 * Módulo sin componentes, compartido por los dominios de 2.7.
 */
import { isFiniteNumber } from '../../../utils/typeGuards'

const pad = (n: number) => String(n).padStart(2, '0')

/** 312 → «5:12»; 3725 → «1:02:05». Valores no finitos o negativos se leen 0:00. */
export function formatDuration(seconds: number | null | undefined): string {
  const total = isFiniteNumber(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** Duración en palabras para lectores de pantalla: «5 minutos 12 segundos». */
export function spokenDuration(seconds: number | null | undefined): string {
  const total = isFiniteNumber(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h) parts.push(`${h} ${h === 1 ? 'hora' : 'horas'}`)
  if (m) parts.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`)
  if (s || parts.length === 0) parts.push(`${s} ${s === 1 ? 'segundo' : 'segundos'}`)
  return parts.join(' ')
}

/** Acota un número al rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
