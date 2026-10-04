/**
 * Reglas del dominio de calidad (CriterionRow, CallRow, CallList, AudioPlayer).
 * Módulo sin componentes: los archivos de componente solo exportan componentes (fast refresh).
 */
import type { CallId, CallSummary, CriterionResult, SeverityLevel } from '../../../public/types'
import { severityOf } from '../../ui/internal/severity'

export const CRITERION_LABEL = {
  cumple: 'Cumple',
  no_cumple: 'No cumple',
  no_aplica: 'No aplica',
} as const satisfies Record<CriterionResult, string>

export const GRAVE_LABEL = {
  cumple: 'Sin error grave',
  no_cumple: 'Error grave',
  no_aplica: 'No aplica',
} as const satisfies Record<CriterionResult, string>

const RESULTS = ['cumple', 'no_cumple', 'no_aplica'] as const satisfies ReadonlyArray<CriterionResult>

/** Resultado conocido o `undefined` (consumidores JS pueden pasar cualquier texto). */
export function toCriterionResult(value: string | undefined): CriterionResult | undefined {
  return RESULTS.find((item) => item === value)
}

/** Evidencia bajo este valor se marca como débil. */
export const WEAK_EVIDENCE = 40

/**
 * Severidad de una llamada evaluada: error grave → crítico; puntaje bajo el umbral → advertencia;
 * resto normal. Sin puntaje (pendiente) es normal.
 */
export function callSeverity(call: Pick<CallSummary, 'score' | 'critical'>, threshold = 50): SeverityLevel {
  if (call.critical) return 'critical'
  return severityOf(call.score, { warning: threshold })
}

export const CALL_SEVERITY_LABEL = {
  critical: 'Error grave',
  warning: 'Puntaje bajo',
  normal: 'Sin alertas',
} as const satisfies Record<SeverityLevel, string>

/** Índice de la llamada que recibe el foco al moverse con flechas, Inicio y Fin; -1 si la tecla no aplica. */
export function nextCallIndex(key: string, current: number, length: number): number {
  if (length === 0) return -1
  switch (key) {
    case 'ArrowDown': return current < 0 ? 0 : Math.min(length - 1, current + 1)
    case 'ArrowUp': return current < 0 ? 0 : Math.max(0, current - 1)
    case 'Home': return 0
    case 'End': return length - 1
    default: return -1
  }
}

/** Id del DOM de una opción (seguro para atributos aunque el id traiga espacios). */
export function callOptionKey(id: CallId): string {
  return String(id).replace(/[^A-Za-z0-9_-]/g, '_')
}

/** Siguiente velocidad del ciclo (vuelve a la primera al final). */
export function nextRate(rates: ReadonlyArray<number>, current: number): number {
  if (rates.length === 0) return 1
  const index = rates.indexOf(current)
  return rates[(index + 1) % rates.length] ?? rates[0] ?? 1
}

/** Alturas (20–100 %) de una onda decorativa estable: misma semilla, misma onda (sin Math.random). */
export function waveHeights(bars: number, seed = 7): number[] {
  let state = seed
  const heights: number[] = []
  for (let i = 0; i < bars; i += 1) {
    state = (state * 9301 + 49297) % 233280
    heights.push(20 + Math.round((state / 233280) * 80))
  }
  return heights
}

/** Parte un texto en tramos con y sin resaltar según los términos (sin distinguir mayúsculas). */
export function splitHighlights(text: string, terms: ReadonlyArray<string> | undefined): Array<{ text: string; hit: boolean }> {
  const clean = (terms ?? []).map((term) => term.trim()).filter(Boolean)
  if (clean.length === 0 || text === '') return [{ text, hit: false }]
  const escaped = clean.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const lower = new Set(clean.map((term) => term.toLowerCase()))
  return text.split(pattern).filter((part) => part !== '').map((part) => ({ text: part, hit: lower.has(part.toLowerCase()) }))
}
