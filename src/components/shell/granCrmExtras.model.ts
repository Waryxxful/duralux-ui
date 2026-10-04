/**
 * Lógica sin componentes de GranCrmExtras: clases de StatusBadge/StatusButton y la traducción
 * de la firma GranCRM de StatCard (`variant`, `icon` corto, `change`) a StatsCard.
 * Vive fuera de GranCrmExtras.tsx para que ese archivo solo exporte componentes (DX-021).
 */
import type { IndicatorDelta, IndicatorTone, StatCardProps, StatusBadgeProps } from '../../public/types'
import { cx } from '../../utils/cx'
import { toneFromLegacy } from '../ui/internal/indicator'
import { log } from '../../utils/log'

/** `alert-circle` → `feather-alert-circle`; una clase completa se respeta. */
export function statCardIcon(icon: StatCardProps['icon']): string | undefined {
  if (!icon) return undefined
  return icon.startsWith('feather-') ? icon : `feather-${icon}`
}

/** `warning`, `light-warning` o `light-brand` → tono del indicador. */
export function statCardTone(variant: StatCardProps['variant']): IndicatorTone {
  const tone = toneFromLegacy(variant)
  if (tone) return tone
  log.debug(`StatCard: variant "${String(variant)}" no tiene tono de indicador; se usa "neutral".`)
  return 'neutral'
}

/** `change` (porcentaje) → variación con signo, `%` y su etiqueta de comparación. */
export function statCardDelta(change: StatCardProps['change']): IndicatorDelta | undefined {
  if (!change) return undefined
  return { value: change.value, unit: '%', label: change.label }
}

/**
 * Mismo contrato de clases que Badge (`badge bg-{tono}` o `badge bg-soft-{tono} text-{tono}`).
 * Se arma aquí porque Badge todavía no reenvía ref; cuando lo haga, StatusBadge vuelve a envolverlo.
 */
export function statusBadgeClassName(status: StatusBadgeProps['status'], soft: boolean | undefined, asButton: boolean, className?: string): string {
  return cx('badge', soft ? `bg-soft-${status} text-${status}` : `bg-${status}`, asButton && 'border-0', className)
}
