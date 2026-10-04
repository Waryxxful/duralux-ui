import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { MiniStatCardProps } from '../../public/types'
import { formatDelta, resolveTone } from './internal/indicator'
import { IndicatorContext, IndicatorDeltaChip, IndicatorGlyph, IndicatorValue } from './internal/IndicatorParts'

/**
 * MiniStatCard — cifra compacta con borde punteado para grillas densas de KPIs.
 *
 * - tone (o `color`, equivalente): ícono con roles `--gcu-{tono}-soft` / `--gcu-{tono}-text`.
 * - delta y context: la cifra nunca queda sin referencia.
 * - Responde a su contenedor: centrada en celdas angostas; ícono a la izquierda desde 20rem.
 * Estilos: src/styles/components/mini-stat-card.css e indicator.css.
 */
export const MiniStatCard = /* @__PURE__ */ forwardRef<HTMLDivElement, MiniStatCardProps>(function MiniStatCard({
  icon,
  value,
  label,
  color,
  tone,
  delta,
  context,
  loading = false,
  emptyText,
  className,
  ...rest
}, ref) {
  const resolvedTone = resolveTone('MiniStatCard', tone ?? color, undefined, 'primary')
  const formattedDelta = formatDelta('MiniStatCard', delta)

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('card', 'stretch', 'stretch-full', 'gcu-mini-stat', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <div className="card-body gcu-mini-stat__body">
        {icon && (
          <span className={cx('gcu-stat__icon', `gcu-stat__icon--${resolvedTone}`)}>
            <IndicatorGlyph icon={icon} />
          </span>
        )}
        <div className="gcu-mini-stat__figures">
          <IndicatorValue value={value} loading={loading} />
          <p className="gcu-stat__label">{label}</p>
          {formattedDelta && !loading && <IndicatorDeltaChip delta={formattedDelta} label={delta?.label} />}
          <IndicatorContext value={value} loading={loading} context={context} emptyText={emptyText} />
        </div>
      </div>
    </div>
  )
})
