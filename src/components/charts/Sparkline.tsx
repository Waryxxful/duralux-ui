import { forwardRef, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { isArray } from '../../utils/typeGuards'
import type { ApexChartOptions, SparklineProps } from '../../public/chart-types'
import { ApexChart } from './ApexChart'
import { compactColors, describeSeries, numberFormatter, resolveCompactTone, useCompactChart } from './compactChartModel'

/**
 * Sparkline — tendencia mínima bajo una cifra (KpiCard, Spotlight, ColoredStatCard).
 *
 * - Figura accesible (DX-004) con nombre (`ariaLabel`), descripción automática («De 78 a 85 en
 *   6 puntos; mínimo…, máximo…») y tabla de datos oculta.
 * - tone: color de la serie con roles `status-*` del tema; `onColor` para superficies de color.
 * - Sin ejes ni grilla: acompaña a una cifra que ya tiene su contexto en texto.
 * - Motor: ApexCharts, solo en `@duralux/ui/charts/apex` (nunca en el bundle raíz).
 */
export const Sparkline = /* @__PURE__ */ forwardRef<HTMLElement, SparklineProps>(function Sparkline({
  data,
  categories,
  name,
  ariaLabel,
  tone,
  onColor = false,
  variant = 'area',
  height = 48,
  formatValue,
  description,
  theme,
  className,
  ...rest
}, ref) {
  const { mode, setRef } = useCompactChart(theme, ref)
  const resolvedTone = resolveCompactTone('Sparkline', tone)
  const values = useMemo(() => (isArray(data) ? [...data] : []), [data])
  const format = useMemo(() => numberFormatter(formatValue), [formatValue])
  const options = useMemo<ApexChartOptions>(() => {
    const palette = compactColors(mode)
    const color = onColor ? palette.onColor : palette.tone(resolvedTone)
    return {
      chart: { sparkline: { enabled: true }, toolbar: { show: false }, background: 'transparent', zoom: { enabled: false } },
      colors: [color],
      stroke: { width: 2, curve: 'smooth' },
      fill: variant === 'area'
        ? { type: 'gradient', gradient: { shadeIntensity: 0, opacityFrom: onColor ? 0.3 : 0.28, opacityTo: 0 } }
        : { type: 'solid', opacity: 1 },
      tooltip: { enabled: true, theme: onColor || mode !== 'light' ? 'dark' : 'light', x: { show: Boolean(categories) }, y: { formatter: format }, marker: { show: false } },
      xaxis: categories ? { categories: [...categories] } : undefined,
    }
  }, [categories, format, mode, onColor, resolvedTone, variant])

  return (
    <ApexChart
      {...rest}
      ref={setRef}
      type={variant}
      height={height}
      series={[{ name: name ?? ariaLabel, data: values }]}
      options={options}
      ariaLabel={ariaLabel}
      description={description ?? describeSeries(values, format)}
      theme={theme}
      className={cx('gcu-sparkline', onColor && 'gcu-sparkline--on-color', className)}
    />
  )
})
