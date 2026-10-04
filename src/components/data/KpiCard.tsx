import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { KpiCardProps } from '../../public/types'
import { formatDelta, hasIndicatorContent, headingTag, resolveTone, warnMissingContext } from '../ui/internal/indicator'
import { Severity } from '../ui/Severity'
import { IndicatorContext, IndicatorDeltaChip, IndicatorGlyph, IndicatorValue } from '../ui/internal/IndicatorParts'

/**
 * KpiCard — una cifra con su contexto obligatorio (meta, variación o tendencia) y un tono.
 *
 * - Úsala de a 2 o 3 cuando cada cifra lleva a su propia acción; para 2–4 métricas relacionadas
 *   usa StatGroup. Nunca abras una página con cuatro KPI iguales (REGLAS-DE-DISENO §1).
 * - delta: variación con signo, unidad y flecha (nunca solo color). context: «Meta 80 %».
 *   chart: Sparkline de `@duralux/ui/charts/apex`. Sin ninguno de los tres, avisa por consola.
 * - tone `danger`/`warning` + `status` («Bajo la meta»): el estado va en texto y con forma.
 * - Cifras es-CL y tabulares; `unit` como sufijo pequeño. loading: skeleton + `aria-busy`.
 * - Responde a su contenedor: angosta, la variación baja bajo la cifra.
 * Estilos: src/styles/components/kpi-card.css e indicator.css.
 */
export const KpiCard = /* @__PURE__ */ forwardRef<HTMLDivElement, KpiCardProps>(function KpiCard({
  label,
  value,
  unit,
  icon,
  delta,
  context,
  tone,
  status,
  chart,
  footer,
  loading = false,
  emptyText,
  headingLevel = 3,
  className,
  ...rest
}, ref) {
  const resolvedTone = resolveTone('KpiCard', tone, undefined, 'primary')
  const formattedDelta = formatDelta('KpiCard', delta)
  const hasChart = hasIndicatorContent(chart)
  warnMissingContext('KpiCard', label, Boolean(formattedDelta) || hasIndicatorContent(context) || hasChart)
  const Heading = headingTag(headingLevel, 'h3')
  const alert = resolvedTone === 'danger' || resolvedTone === 'warning'

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('card', 'gcu-kpi-card', 'gcu-container', alert && `gcu-kpi-card--${resolvedTone}`, className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <div className="card-body gcu-kpi-card__body">
        <div className="gcu-kpi-card__head">
          {icon && (
            <span className={cx('gcu-stat__icon', `gcu-stat__icon--${resolvedTone}`, 'gcu-kpi-card__icon')}>
              <IndicatorGlyph icon={icon} />
            </span>
          )}
          <Heading className="gcu-kpi-card__label">{label}</Heading>
        </div>
        <div className="gcu-kpi-card__row">
          <IndicatorValue value={value} unit={unit} loading={loading} className="gcu-kpi-card__value" />
          {formattedDelta && !loading && (
            <IndicatorDeltaChip className="gcu-kpi-card__delta" delta={formattedDelta} label={delta?.label} />
          )}
        </div>
        {!loading && hasIndicatorContent(status) && (
          <p className="gcu-kpi-card__status">
            <Severity level={resolvedTone === 'danger' ? 'critical' : alert ? 'warning' : 'normal'} label={status} size="sm" />
          </p>
        )}
        <IndicatorContext value={value} loading={loading} context={context} emptyText={emptyText} />
        {hasChart && !loading && <div className="gcu-kpi-card__chart">{chart}</div>}
      </div>
      {hasIndicatorContent(footer) && <div className="card-footer gcu-kpi-card__footer">{footer}</div>}
    </div>
  )
})
