import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { deprecate } from '../../utils/log'
import type { ColoredStatCardProps, IndicatorTone } from '../../public/types'
import { formatDelta, formatLegacyTrend, isEmptyIndicatorValue, resolveTone } from './internal/indicator'
import { IndicatorContext, IndicatorDeltaChip, IndicatorGlyph, IndicatorValue } from './internal/IndicatorParts'

/**
 * ColoredStatCard — cifra destacada sobre una superficie de color con grano (Craft «Noise»).
 *
 * - tone: relleno profundo de la paleta con texto blanco AA (≈ 7:1) en claro, oscuro y navy.
 *   `bg` (clase `bg-{tono}`) está deprecado: se traduce al tono y la clase no llega al DOM,
 *   porque `.bg-*` de Bootstrap y `.card` / `.avatar-text` del tema oscuro usan prioridad forzada.
 * - delta: variación con signo, unidad y flecha sobre vidrio sombreado. `trend`/`trendUp` deprecados.
 * - chart: mini gráfico opcional al pie.
 * Estilos: src/styles/components/colored-stat-card.css e indicator.css.
 */
export const ColoredStatCard = forwardRef<HTMLDivElement, ColoredStatCardProps>(function ColoredStatCard({
  icon,
  value,
  label,
  tone,
  delta,
  context,
  trend,
  trendUp,
  bg,
  chart,
  loading = false,
  emptyText,
  className,
  ...rest
}, ref) {
  if (bg !== undefined) deprecate('coloredstatcard-bg', 'la prop `bg` de ColoredStatCard se reemplaza por `tone` ("primary", "success"…).')
  if (trend !== undefined || trendUp !== undefined) {
    deprecate('coloredstatcard-trend', 'las props `trend`/`trendUp` de ColoredStatCard se reemplazan por `delta` ({ value: número, unit, label }).')
  }
  // `neutral` no es una superficie de color: cae en `dark`, que sí cumple AA con blanco.
  const parsedTone: IndicatorTone = resolveTone('ColoredStatCard', tone, bg, 'primary')
  const resolvedTone = parsedTone === 'neutral' ? 'dark' : parsedTone
  const formattedDelta = formatDelta('ColoredStatCard', delta) ?? formatLegacyTrend(trend, trendUp)
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
            {formattedDelta && <IndicatorDeltaChip className="gcu-colored-stat__glass" delta={formattedDelta} label={delta?.label} />}
            <IndicatorContext value={value} context={context} emptyText={emptyText} />
          </div>
        )}
      </div>
      {chart && <div className="gcu-colored-stat__chart">{chart}</div>}
    </div>
  )
})
