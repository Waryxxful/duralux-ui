import { forwardRef, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber } from '../../utils/typeGuards'
import type { ApexChartOptions, CompactChartTone, DonutProps } from '../../public/chart-types'
import { ApexChart } from './ApexChart'
import { compactColors, numberFormatter, useCompactChart } from './compactChartModel'

const ORDER: ReadonlyArray<CompactChartTone> = ['primary', 'info', 'warning', 'indigo', 'success', 'secondary']

/**
 * Donut — distribución de pocas categorías (canales, tipificaciones, motivos) con total al centro.
 *
 * - Hasta 6 categorías; con más avisa por consola: usa RankList (las barras se comparan mejor).
 * - La leyenda nombra cada categoría con su cifra; la descripción lista «categoría: cifra (n %)».
 * - Colores con roles `status-*` del tema; borde de la superficie entre porciones.
 * - Figura accesible (DX-004) con tabla de datos oculta. Motor solo en `@duralux/ui/charts/apex`.
 */
export const Donut = /* @__PURE__ */ forwardRef<HTMLElement, DonutProps>(function Donut({
  labels,
  values,
  total,
  totalLabel = 'Total',
  height = 240,
  ariaLabel,
  formatValue,
  description,
  theme,
  className,
  ...rest
}, ref) {
  const { mode, setRef } = useCompactChart(theme, ref)
  const names = useMemo(() => (isArray(labels) ? [...labels] : []), [labels])
  const data = useMemo(() => (isArray(values) ? values.map((value) => (isFiniteNumber(value) ? value : 0)) : []), [values])
  if (names.length > 6) log.warn(`Donut: ${names.length} categorías son demasiadas para un anillo; usa RankList.`)
  if (names.length !== data.length) log.warn(`Donut: ${names.length} etiquetas para ${data.length} valores.`)
  const format = useMemo(() => numberFormatter(formatValue), [formatValue])
  const sum = data.reduce((acc, value) => acc + value, 0)
  const totalText = total ?? format(sum)
  const options = useMemo<ApexChartOptions>(() => {
    const palette = compactColors(mode)
    return {
      chart: { background: 'transparent' },
      labels: names,
      colors: ORDER.map((tone) => palette.tone(tone)),
      stroke: { width: 2, colors: [palette.surface] },
      dataLabels: { enabled: false },
      legend: { position: 'bottom', formatter: (name: string, opts: { seriesIndex: number }) => `${name}: ${format(data[opts.seriesIndex] ?? 0)}` },
      tooltip: { y: { formatter: format } },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              value: { color: palette.text, formatter: (raw: string) => format(Number(raw)) },
              total: { show: true, label: totalLabel, color: palette.muted, formatter: () => totalText },
            },
          },
        },
      },
    }
  }, [data, format, mode, names, totalLabel, totalText])
  const summary = names
    .map((name, index) => {
      const value = data[index] ?? 0
      const share = sum > 0 ? Math.round((value / sum) * 100) : 0
      return `${name}: ${format(value)} (${share} %)`
    })
    .join('; ')

  return (
    <ApexChart
      {...rest}
      ref={setRef}
      type="donut"
      height={height}
      series={data}
      options={options}
      ariaLabel={ariaLabel}
      description={description ?? `${totalLabel} ${totalText}. ${summary}.`}
      theme={theme}
      className={cx('gcu-donut', className)}
    />
  )
})
