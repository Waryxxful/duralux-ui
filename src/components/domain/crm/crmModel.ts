/**
 * Reglas del dominio CRM (PipelineBoard, Funnel).
 * Módulo sin componentes: los archivos de componente solo exportan componentes (fast refresh).
 */
import type { PipelineDeal, PipelineStage } from '../../../public/types'
import { isFiniteNumber } from '../../../utils/typeGuards'

const clpFormat = /* @__PURE__ */ new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

/** Monto en CLP sin decimales: 1240000 → «$1.240.000». */
export function formatClp(value: number): string {
  return clpFormat.format(isFiniteNumber(value) ? value : 0)
}

/** Tipo de dato del arrastre: solo se aceptan oportunidades de este tablero. */
export const DEAL_DRAG_TYPE = 'application/x-gcu-deal'

/**
 * Etapa vecina para mover con teclado (Alt + ← / →). `null` en los extremos, con una etapa
 * desconocida o una dirección que no aplica.
 */
export function neighborStage(
  stages: ReadonlyArray<PipelineStage>,
  current: string,
  direction: 'previous' | 'next',
): PipelineStage | null {
  const index = stages.findIndex((stage) => stage.key === current)
  if (index < 0) return null
  return stages[index + (direction === 'next' ? 1 : -1)] ?? null
}

/** Dirección de una tecla de movimiento (Alt + flecha); `null` si la combinación no mueve. */
export function moveDirection(key: string, altKey: boolean): 'previous' | 'next' | null {
  if (!altKey) return null
  if (key === 'ArrowRight') return 'next'
  if (key === 'ArrowLeft') return 'previous'
  return null
}

/** El movimiento es válido: la oportunidad existe, cambia de etapa y la etapa destino es conocida. */
export function canMove(
  deals: ReadonlyArray<PipelineDeal>,
  stages: ReadonlyArray<PipelineStage>,
  dealId: string,
  toStage: string,
): boolean {
  const deal = deals.find((item) => item.id === dealId)
  return Boolean(deal) && deal?.stage !== toStage && stages.some((stage) => stage.key === toStage)
}

/** Conversión de un paso respecto del anterior (entero, 0–100+); `null` en el primero o sin base. */
export function stepConversion(value: number, previous: number | undefined): number | null {
  if (!isFiniteNumber(previous) || previous <= 0 || !isFiniteNumber(value)) return null
  return Math.round((value / previous) * 100)
}
