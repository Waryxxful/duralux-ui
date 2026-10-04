/**
 * Reglas de severidad y de rango de puntaje (Severity, Score, ScoreHero, AppStatusCard).
 * Módulo sin componentes: los archivos de componente solo exportan componentes (fast refresh).
 */
import type { ScoreRange, ScoreThresholds, SeverityLevel, SeverityThresholds } from '../../../public/types'
import { log } from '../../../utils/log'
import { isFiniteNumber } from '../../../utils/typeGuards'

export const SEVERITY_LABEL = {
  critical: 'Crítico',
  warning: 'Advertencia',
  normal: 'Normal',
} satisfies Record<SeverityLevel, string>

const SEVERITY_LEVELS = /* @__PURE__ */ new Set<string>(Object.keys(SEVERITY_LABEL))

export function isSeverityLevel(value: unknown): value is SeverityLevel {
  return typeof value === 'string' && SEVERITY_LEVELS.has(value)
}

/**
 * Severidad a partir de un valor y sus umbrales.
 * - Por defecto más es mejor: bajo `warning` (50) es advertencia; bajo `critical` (si se da), crítico.
 * - `higherIsWorse` (abandono, TMO): desde `warning` es advertencia; desde `critical`, crítico.
 * - Un valor ausente o no finito es «normal» (no hay nada que atender) y se registra en debug.
 */
export function severityOf(value: number | null | undefined, thresholds: SeverityThresholds = {}): SeverityLevel {
  if (!isFiniteNumber(value)) {
    if (value !== null && value !== undefined) log.debug(`severityOf: valor no numérico "${String(value)}"; se usa "normal".`)
    return 'normal'
  }
  const { warning = 50, critical, higherIsWorse = false } = thresholds
  const reaches = (limit: number) => (higherIsWorse ? value >= limit : value < limit)
  if (isFiniteNumber(critical) && reaches(critical)) return 'critical'
  return reaches(warning) ? 'warning' : 'normal'
}

export const SCORE_RANGE_LABEL = {
  ok: 'Bueno',
  medio: 'Medio',
  bajo: 'Bajo',
  anulado: 'Anulado',
} satisfies Record<ScoreRange, string>

/** Rango de un puntaje: ok desde 80 % del máximo, medio desde 50 %, si no bajo; anulado gana siempre. */
export function scoreRangeOf(
  value: number,
  max = 100,
  thresholds: ScoreThresholds = {},
  voided = false,
): ScoreRange {
  if (voided) return 'anulado'
  const ok = thresholds.ok ?? max * 0.8
  const medio = thresholds.medio ?? max * 0.5
  if (value >= ok) return 'ok'
  return value >= medio ? 'medio' : 'bajo'
}

/** Máximo válido de un puntaje (> 0); si no, 100 con aviso. */
export function resolveScoreMax(component: string, max: number | undefined): number {
  if (max === undefined) return 100
  if (isFiniteNumber(max) && max > 0) return max
  log.warn(`${component}: max debe ser un número mayor que 0 (recibido: ${String(max)}); se usa 100.`)
  return 100
}

/** Avisa (sin corregir) un puntaje fuera de 0–max: el dato llega mal desde el origen. */
export function checkScoreValue(component: string, value: number, max: number): void {
  if (value < 0 || value > max) log.warn(`${component}: el puntaje ${value} está fuera del rango 0–${max}.`)
}
