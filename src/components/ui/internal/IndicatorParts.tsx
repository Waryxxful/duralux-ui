import type * as React from 'react'
import { cx } from '../../../utils/cx'
import { isString } from '../../../utils/typeGuards'
import { renderIconSlot } from '../../../utils/iconSlot'
import type { IndicatorIcon } from '../../../public/types'
import type { FormattedDelta } from './indicator'
import { formatIndicatorValue, isEmptyIndicatorValue, isIconClass } from './indicator'

const ARROW = {
  up: 'feather-arrow-up-right',
  down: 'feather-arrow-down-right',
  flat: 'feather-minus',
} satisfies Record<FormattedDelta['direction'], string>

/** Glifo del indicador: clase completa (`feather-users`), nombre Feather o SVG Tabler. Siempre decorativo. */
export function IndicatorGlyph({ icon }: { icon: IndicatorIcon | null | undefined }) {
  if (isString(icon) && isIconClass(icon)) return <i className={icon} aria-hidden="true" />
  return renderIconSlot(icon, { size: 'lg' })
}

interface IndicatorDeltaChipProps {
  delta: FormattedDelta
  label?: React.ReactNode
  className?: string
  /** Clase extra de la cifra (p. ej. el vidrio de ColoredStatCard). */
  valueClassName?: string
}

/**
 * Variación con forma + texto + sentido hablado: la flecha es decorativa, el signo y la unidad
 * van en el texto y «Sube/Baja» se anuncia. El color (positivo/negativo) solo acompaña.
 */
export function IndicatorDeltaChip({ delta, label, className, valueClassName }: IndicatorDeltaChipProps) {
  return (
    <span className={cx('gcu-stat-delta', `gcu-stat-delta--${delta.sentiment}`, className)} data-direction={delta.direction}>
      <span className={cx('gcu-stat-delta__value', 'gcu-tabular', valueClassName)}>
        <i className={cx(ARROW[delta.direction], 'gcu-stat-delta__arrow')} aria-hidden="true" />
        <span className="visually-hidden">{delta.spoken} </span>
        {delta.text}
      </span>
      {label !== undefined && label !== null && label !== '' && <span className="gcu-stat-delta__label">{label}</span>}
    </span>
  )
}

/** Skeleton de la cifra: conserva la altura de la línea para que la tarjeta no salte al cargar. */
function IndicatorSkeleton({ className }: { className?: string }) {
  return (
    <>
      <span className={cx('gcu-skeleton', 'gcu-stat__skeleton', className)} aria-hidden="true" />
      <span className="visually-hidden">Cargando</span>
    </>
  )
}

interface IndicatorValueProps {
  value: React.ReactNode
  loading?: boolean
  className?: string
}

/** Cifra principal: es-CL + tabular; en carga, skeleton; vacía, un guion decorativo (la explicación va en el contexto). */
export function IndicatorValue({ value, loading = false, className }: IndicatorValueProps) {
  let content: React.ReactNode
  if (loading) content = <IndicatorSkeleton />
  else if (isEmptyIndicatorValue(value)) content = <span aria-hidden="true">—</span>
  else content = formatIndicatorValue(value)
  return <div className={cx('gcu-stat__value', 'gcu-tabular', className)}>{content}</div>
}

interface IndicatorContextProps {
  value: React.ReactNode
  loading?: boolean
  context?: React.ReactNode
  emptyText?: React.ReactNode
  className?: string
}

/** Línea de contexto («Meta 80 %»); si la cifra está vacía, explica por qué. */
export function IndicatorContext({ value, loading = false, context, emptyText, className }: IndicatorContextProps) {
  if (loading) return null
  const text = isEmptyIndicatorValue(value) ? (emptyText ?? 'Sin datos para este periodo') : context
  if (text === undefined || text === null || text === '' || text === false) return null
  return <p className={cx('gcu-stat__context', className)}>{text}</p>
}
