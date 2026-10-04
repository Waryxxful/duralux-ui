import { forwardRef, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray } from '../../utils/typeGuards'
import type { ApexChartOptions, TrendLineProps } from '../../public/chart-types'
import { ApexChart } from './ApexChart'
import { compactColors, describeSeries, numberFormatter, resolveCompactTone, useCompactChart } from './compactChartModel'

/**
 * TrendLine — evolución en el tiempo (nivel de servicio, TMO, conversión) con meta opcional.
 *
 * - Serie principal en el tono pedido (línea continua) y comparación en gris punteada: la serie
 *   se distingue por forma, no solo por color. La leyenda nombra cada serie.
 * - target: línea de meta horizontal punteada con su etiqueta («Meta 80 %»).
 * - Figura accesible con descripción automática de la serie principal y tabla de datos oculta.
 * - Cifras del eje en es-CL (o `formatValue`). Motor solo en `@duralux/ui/charts/apex`.
 */
export const TrendLine = /* @__PURE__ */ forwardRef<HTMLElement, TrendLineProps>(function TrendLine({
  series,
  categories,
  target,
  tone,
  height = 240,
  ariaLabel,
  formatValue,
  description,
  theme,
  className,
  ...rest
}, ref) {
  const { mode, setRef } = useCompactChart(theme, ref)
  const resolvedTone = resolveCompactTone('TrendLine', tone)
  const list = useMemo(() => (isArray(series) ? series : []), [series])
  if (list.length > 2) log.warn(`TrendLine: muestra una serie y, como mucho, una de comparación (recibidas: ${list.length}).`)
  const apexSeries = useMemo(() => list.map((item) => ({ name: item.name, data: [...item.data] })), [list])
  const format = useMemo(() => numberFormatter(formatValue), [formatValue])
  const options = useMemo<ApexChartOptions>(() => {
    const palette = compactColors(mode)
    return {
      chart: { toolbar: { show: false }, zoom: { enabled: false }, background: 'transparent' },
      colors: [palette.tone(resolvedTone), palette.muted, palette.tone('warning')],
      stroke: { width: [3, 2, 2], curve: 'smooth', dashArray: [0, 5, 2] },
      markers: { size: 0, hover: { size: 5 } },
      dataLabels: { enabled: false },
      grid: { strokeDashArray: 3, xaxis: { lines: { show: false } } },
      xaxis: { categories: [...(categories ?? [])], axisTicks: { show: false } },
      yaxis: { labels: { formatter: format } },
      legend: { show: list.length > 1, position: 'top', horizontalAlign: 'left' },
      tooltip: { y: { formatter: format } },
      annotations: target ? {
        yaxis: [{
          y: target.value,
          borderColor: palette.text,
          strokeDashArray: 4,
          label: { text: target.label, borderColor: 'transparent', position: 'left', textAnchor: 'start', style: { background: palette.surface, color: palette.text } },
        }],
      } : undefined,
    }
  }, [categories, format, list.length, mode, resolvedTone, target])
  const main = list[0]
  const summary = main ? `${main.name}: ${describeSeries(main.data, format)}${target ? ` ${target.label}.` : ''}` : undefined

  return (
    <ApexChart
      {...rest}
      ref={setRef}
      type="line"
      height={height}
      series={apexSeries}
      options={options}
      ariaLabel={ariaLabel}
      description={description ?? summary}
      theme={theme}
      className={cx('gcu-trend-line', className)}
    />
  )
})
