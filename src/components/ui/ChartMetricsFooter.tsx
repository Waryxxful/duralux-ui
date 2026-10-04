import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'
import type { ChartMetric, ChartMetricsFooterProps } from '../../public/types'
import { formatDelta } from './internal/indicator'
import { IndicatorDeltaChip, IndicatorValue } from './internal/IndicatorParts'

function metricIdentity(metric: ChartMetric | undefined): string {
  const candidate = metric?.id ?? metric?.label ?? metric?.value
  if (isString(candidate)) return `string:${candidate}`
  if (isFiniteNumber(candidate)) return `number:${String(candidate)}`
  return 'metric'
}

function metricEntries(metrics: ChartMetricsFooterProps['metrics']) {
  const occurrences = new Map<string, number>()
  return (isArray(metrics) ? metrics : []).map((metric: ChartMetric) => {
    const identity = metricIdentity(metric)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { metric, key: `${identity}~${occurrence}` }
  })
}

/**
 * ChartMetricsFooter — 2 a 4 cifras bajo un gráfico («Atendidas 2.840 · Abandonadas 124»).
 *
 * - Lista de definición (`<dl>`): el lector de pantalla oye etiqueta y luego cifra.
 * - Cifras es-CL tabulares; cada una puede llevar `delta` con signo, unidad y flecha.
 * - Responde a su contenedor: en una fila con separadores desde 28rem; en dos columnas si es angosto.
 * Estilos: src/styles/components/chart-metrics-footer.css e indicator.css.
 */
export const ChartMetricsFooter = forwardRef<HTMLDivElement, ChartMetricsFooterProps>(function ChartMetricsFooter({
  metrics = [],
  loading = false,
  className,
  ...rest
}, ref) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('gcu-chart-metrics', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <dl className="gcu-chart-metrics__list">
        {metricEntries(metrics).map(({ metric, key }) => {
          const delta = loading ? null : formatDelta('ChartMetricsFooter', metric.delta)
          return (
            <div className="gcu-chart-metrics__item" key={key}>
              <dt className="gcu-chart-metrics__label">{metric.label}</dt>
              <dd className={cx('gcu-chart-metrics__value', 'gcu-tabular', metric.color)}>
                <IndicatorValue className="gcu-chart-metrics__figure" value={metric.value} loading={loading} />
              </dd>
              {delta && (
                <dd className="gcu-chart-metrics__delta">
                  <IndicatorDeltaChip delta={delta} label={metric.delta?.label} />
                </dd>
              )}
            </div>
          )
        })}
      </dl>
    </div>
  )
})
