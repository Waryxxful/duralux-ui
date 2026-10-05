/**
 * Reglas del dominio de operación (TargetBar, QueueCard, AgentStatusBoard, Heatmap).
 * Módulo sin componentes: los archivos de componente solo exportan componentes (fast refresh).
 */
import type { AgentPresence, SeverityLevel } from '../../../public/types'
import { isFiniteNumber } from '../../../utils/typeGuards'

export type TargetStatus = 'ok' | 'near' | 'off'

/**
 * Estado de una cifra contra su meta.
 * - Más es mejor: ok desde la meta; cerca desde `meta × (1 − margen)`; si no, fuera.
 * - `higherIsWorse` (abandono, TMO): ok hasta la meta; cerca hasta `meta × (1 + margen)`.
 */
export function targetStatus(value: number, target: number, higherIsWorse = false, margin = 0.1): TargetStatus {
  const safeMargin = isFiniteNumber(margin) && margin >= 0 ? margin : 0.1
  if (higherIsWorse) {
    if (value <= target) return 'ok'
    return value <= target * (1 + safeMargin) ? 'near' : 'off'
  }
  if (value >= target) return 'ok'
  return value >= target * (1 - safeMargin) ? 'near' : 'off'
}

export const TARGET_SEVERITY = {
  ok: 'normal',
  near: 'warning',
  off: 'critical',
} as const satisfies Record<TargetStatus, SeverityLevel>

/** Texto del estado; con más es peor la meta funciona como máximo. */
export function targetStatusLabel(status: TargetStatus, higherIsWorse = false): string {
  if (status === 'ok') return higherIsWorse ? 'Dentro del máximo' : 'Cumple la meta'
  if (status === 'near') return 'Cerca del umbral'
  return higherIsWorse ? 'Sobre el máximo' : 'Bajo la meta'
}

/** Porcentaje de la escala (0–100) para posicionar barra y meta. */
export function scalePercent(value: number, max: number): number {
  if (!isFiniteNumber(value) || !isFiniteNumber(max) || max <= 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

export const PRESENCE_ORDER = ['disponible', 'en_llamada', 'post_llamada', 'en_pausa', 'desconectado'] as const satisfies ReadonlyArray<AgentPresence>

export const PRESENCE_LABEL = {
  disponible: 'Disponible',
  en_llamada: 'En llamada',
  post_llamada: 'Post llamada',
  en_pausa: 'En pausa',
  desconectado: 'Desconectado',
} as const satisfies Record<AgentPresence, string>

const PRESENCE_COUNT_LABEL = {
  disponible: ['disponible', 'disponibles'],
  en_llamada: ['en llamada', 'en llamada'],
  post_llamada: ['en post llamada', 'en post llamada'],
  en_pausa: ['en pausa', 'en pausa'],
  desconectado: ['desconectado', 'desconectados'],
} as const satisfies Record<AgentPresence, readonly [string, string]>

/** «3 disponibles», «1 en pausa». */
export function presenceCountLabel(presence: AgentPresence, count: number): string {
  const [one, many] = PRESENCE_COUNT_LABEL[presence]
  return `${count} ${count === 1 ? one : many}`
}

/** Presencia conocida o `undefined` (consumidores JS pueden pasar cualquier texto). */
export function toPresence(value: string | undefined): AgentPresence | undefined {
  return PRESENCE_ORDER.find((item) => item === value)
}

/** Cantidad de niveles de la escala del mapa de calor (0 = sin dato o mínimo). */
export const HEAT_LEVELS = 5

/** Nivel 0–4 de un valor dentro del rango [min, max]. */
export function heatLevel(value: number, min: number, max: number): number {
  if (!isFiniteNumber(value)) return 0
  if (max <= min) return value > 0 ? HEAT_LEVELS - 1 : 0
  const ratio = (value - min) / (max - min)
  return Math.min(HEAT_LEVELS - 1, Math.max(0, Math.floor(ratio * HEAT_LEVELS)))
}

/** Límites [desde, hasta] de cada nivel de la escala, para la leyenda. */
export function heatBounds(min: number, max: number): Array<[number, number]> {
  const span = max - min
  const bounds: Array<[number, number]> = []
  for (let level = 0; level < HEAT_LEVELS; level += 1) {
    bounds.push([min + (span * level) / HEAT_LEVELS, min + (span * (level + 1)) / HEAT_LEVELS])
  }
  return bounds
}
