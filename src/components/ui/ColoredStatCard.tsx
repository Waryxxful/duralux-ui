import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { ColoredStatCardProps } from '../../public/types'
import { formatDelta, isEmptyIndicatorValue, resolveTone } from './internal/indicator'
import { IndicatorContext, IndicatorDeltaChip, IndicatorGlyph, IndicatorValue } from './internal/IndicatorParts'

/**
 * ColoredStatCard — cifra destacada sobre una superficie de color con grano (Craft «Noise»).
 *
 * - tone: relleno profundo de la paleta con texto blanco AA (≈ 7:1) en claro, oscuro y navy.
 * - delta: variación con signo, unidad y flecha sobre vidrio sombreado.
 * - chart: mini gráfico opcional al pie.
 * Estilos: src/styles/components/colored-stat-card.css e indicator.css.
 */
export const ColoredStatCard = /* @__PURE__ */ forwardRef<HTMLDivElement, ColoredStatCardProps>(function ColoredStatCard({
  icon,
  value,
  label,
  tone,
  delta,
  context,
  chart,
  loading = false,
  emptyText,
  className,
  ...rest
}, ref) {
  // `neutral` no es un relleno válido (el tipo lo excluye); si llega desde JS cae en `dark` (AA con blanco).
  const parsedTone = resolveTone('ColoredStatCard', tone, undefined, 'primary')
  const resolvedTone = parsedTone === 'neutral' ? 'dark' : parsedTone
  const formattedDelta = formatDelta('ColoredStatCard', delta)
  const showMeta = !loading && Boolean(formattedDelta || context || isEmptyIndicatorValue(value))

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('stretch', 'stretch-full', 'gcu-colored-stat', `gcu-colored-stat--${resolvedTone}`, 'gcu-grain', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <div className="gcu-colored-stat__body">
        <div className="gcu-colored-stat__main">
          <div className="gcu-colored-stat__figures">
            <IndicatorValue value={value} loading={loading} />
            <p className="gcu-stat__label">{label}</p>
          </div>
          {icon && (
            <span className="gcu-colored-stat__icon gcu-colored-stat__glass">
              <IndicatorGlyph icon={icon} />
            </span>
          )}
        </div>
        {showMeta && (
          <div className="gcu-colored-stat__meta">
            {formattedDelta && <IndicatorDeltaChip valueClassName="gcu-colored-stat__glass" delta={formattedDelta} label={delta?.label} />}
            <IndicatorContext value={value} context={context} emptyText={emptyText} />
          </div>
        )}
      </div>
      {chart && <div className="gcu-colored-stat__chart">{chart}</div>}
    </div>
  )
})
