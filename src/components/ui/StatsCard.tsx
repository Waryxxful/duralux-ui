import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { deprecate } from '../../utils/log'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import type { StatsCardProps } from '../../public/types'
import { normalizeProgress } from './internal/progress.js'
import { formatDelta, formatLegacyTrend, resolveTone } from './internal/indicator'
import { IndicatorContext, IndicatorDeltaChip, IndicatorGlyph, IndicatorValue } from './internal/IndicatorParts'

const LEGACY_DEFAULT_ICON_BG = 'bg-gray-200'

/**
 * StatsCard — KPI con ícono, cifra, etiqueta, variación, contexto y progreso opcional.
 *
 * - value: un número se formatea en es-CL con cifras tabulares; `null` muestra el estado vacío.
 * - delta: variación con signo, unidad y flecha («+4 pts vs. semana pasada»). `trend` está deprecado.
 * - context: lo que le da sentido a la cifra («Meta 80 %»). Toda cifra necesita meta, variación o tendencia.
 * - tone: color del ícono con roles semánticos. `iconBg` (clases) está deprecado pero se respeta.
 * - progress: `<progress>` nativo (DX-020). loading: skeleton + aria-busy.
 * - Responde a su contenedor (`.gcu-container`): en una celda angosta la variación baja bajo la cifra.
 * Estilos: src/styles/components/stats-card.css e indicator.css.
 */
export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(function StatsCard({
  icon,
  iconBg,
  tone,
  value,
  label,
  delta,
  context,
  trend,
  progress,
  footer,
  onFooter,
  loading = false,
  emptyText,
  className,
  ...rest
}, ref) {
  if (trend) deprecate('statscard-trend', 'la prop `trend` de StatsCard se reemplaza por `delta` ({ value: número, unit, label }).')
  const hasLegacyIconBg = isString(iconBg) && iconBg !== LEGACY_DEFAULT_ICON_BG
  if (hasLegacyIconBg) deprecate('statscard-iconbg', 'la prop `iconBg` de StatsCard se reemplaza por `tone` ("primary", "info"…).')

  const resolvedTone = resolveTone('StatsCard', tone, iconBg, 'neutral')
  const formattedDelta = formatDelta('StatsCard', delta) ?? formatLegacyTrend(trend?.value, trend?.up)
  const hasFooter = footer !== undefined && footer !== null && footer !== false
  const normalizedProgress = progress ? normalizeProgress(progress.value, progress.max) : null
  const progressLabel = progress && (isString(progress.label) || isFiniteNumber(progress.label))
    ? String(progress.label).trim()
    : ''
  const progressTone = progress ? resolveTone('StatsCard', undefined, progress.color, 'primary') : 'primary'

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('card', 'stretch', 'stretch-full', 'gcu-stats-card', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <div className="card-body gcu-stats-card__body">
        <div className="gcu-stats-card__main">
          {icon && (
            <span className={cx('gcu-stat__icon', `gcu-stat__icon--${resolvedTone}`, 'avatar-lg', hasLegacyIconBg && iconBg)}>
              <IndicatorGlyph icon={icon} />
            </span>
          )}
          <div className="gcu-stats-card__figures">
            <IndicatorValue value={value} loading={loading} />
            <h3 className="gcu-stat__label">{label}</h3>
          </div>
          {formattedDelta && !loading && (
            <IndicatorDeltaChip className="gcu-stats-card__delta" delta={formattedDelta} label={delta?.label} />
          )}
        </div>
        <IndicatorContext value={value} loading={loading} context={context} emptyText={emptyText} />

        {progress && normalizedProgress && (
          <div className="gcu-stats-card__progress">
            <div className="gcu-stats-card__progress-head">
              <span>{progress.label}</span>
              <span className="gcu-tabular">{Math.round(normalizedProgress.percentage)}&nbsp;%</span>
            </div>
            <progress
              className={cx('gcu-stat__meter', `gcu-stat__meter--${progressTone}`)}
              value={normalizedProgress.value}
              max={normalizedProgress.max}
              aria-label={progressLabel || `${Math.round(normalizedProgress.value)} de ${normalizedProgress.max}`}
            />
          </div>
        )}
      </div>
      {hasFooter && (
        isFunction(onFooter)
          ? (
            <button type="button" className="card-footer btn border-0 gcu-stats-card__footer" onClick={onFooter}>
              {footer}
            </button>
          )
          : <div className="card-footer gcu-stats-card__footer">{footer}</div>
      )}
    </div>
  )
})
