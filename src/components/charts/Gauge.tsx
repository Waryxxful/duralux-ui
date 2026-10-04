import { forwardRef, useMemo } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber } from '../../utils/typeGuards'
import type { ApexChartOptions, GaugeProps } from '../../public/chart-types'
import { ApexChart } from './ApexChart'
import { compactColors, numberFormatter, resolveCompactTone, useCompactChart } from './compactChartModel'

/**
 * Gauge — avance radial hacia una meta (cumplimiento, concordancia, ocupación).
 *
 * - Cifra central tabular en es-CL con su unidad; el arco va sobre una pista hundida del tema.
 * - El valor se recorta a 0–max (y se avisa); la descripción dice «84 % de 100 %».
 * - Figura accesible (DX-004) con tabla de datos oculta. Motor solo en `@duralux/ui/charts/apex`.
 */
export const Gauge = /* @__PURE__ */ forwardRef<HTMLElement, GaugeProps>(function Gauge({
  value,
  max = 100,
  unit = '%',
  tone,
  height = 180,
  ariaLabel,
  formatValue,
  description,
  theme,
  className,
  ...rest
}, ref) {
  const { mode, setRef } = useCompactChart(theme, ref)
  const resolvedTone = resolveCompactTone('Gauge', tone)
  const safeMax = isFiniteNumber(max) && max > 0 ? max : 100
  const raw = isFiniteNumber(value) ? value : 0
  if (!isFiniteNumber(value) || value < 0 || value > safeMax) log.warn(`Gauge: el valor ${String(value)} está fuera de 0–${safeMax}; se recorta.`)
  const clamped = Math.max(0, Math.min(safeMax, raw))
  const format = useMemo(() => numberFormatter(formatValue), [formatValue])
  const withUnit = (amount: number) => (unit ? `${format(amount)} ${unit}` : format(amount))
  const options = useMemo<ApexChartOptions>(() => {
    const palette = compactColors(mode)
    const shown = unit ? `${format(clamped)} ${unit}` : format(clamped)
    return {
      chart: { sparkline: { enabled: true }, background: 'transparent' },
      colors: [palette.tone(resolvedTone)],
      labels: [ariaLabel],
      plotOptions: {
        radialBar: {
          startAngle: -120,
          endAngle: 120,
          hollow: { size: '62%' },
          track: { background: palette.track, strokeWidth: '100%' },
          dataLabels: {
            name: { show: false },
            value: { offsetY: 8, fontSize: '1.5rem', fontWeight: 600, color: palette.text, formatter: () => shown },
          },
        },
      },
      stroke: { lineCap: 'round' },
    }
  }, [ariaLabel, clamped, format, mode, resolvedTone, unit])

  return (
    <ApexChart
      {...rest}
      ref={setRef}
      type="radialBar"
      height={height}
      series={[Math.round((clamped / safeMax) * 1000) / 10]}
      options={options}
      ariaLabel={ariaLabel}
      description={description ?? `${withUnit(clamped)} de ${withUnit(safeMax)}.`}
      accessibleTable={false}
      theme={theme}
      className={cx('gcu-gauge', className)}
    />
  )
})
