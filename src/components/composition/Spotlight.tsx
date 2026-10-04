import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import type { SpotlightProps } from '../../public/types'
import { formatDelta, hasIndicatorContent, warnMissingContext } from '../ui/internal/indicator'
import { IndicatorContext, IndicatorDeltaChip, IndicatorValue } from '../ui/internal/IndicatorParts'
import { resolveSurfaceTone } from './surfaceTone'

/**
 * Spotlight — la cifra que es el punto de la página, sobre una superficie de color con grano.
 *
 * - **Uno por página.** Si todo es protagonista, nada lo es: el resto de las cifras va en
 *   KpiCard o StatGroup.
 * - Superficie profunda de la paleta con texto blanco AA (≈ 7:1) en claro, oscuro y navy, y grano
 *   en mosaico (`.gcu-grain`, Craft «Noise»).
 * - delta (signo, unidad y flecha sobre vidrio sombreado) y context son el contexto obligatorio.
 * - children: un Sparkline con `onColor` de `@duralux/ui/charts/apex`.
 * - loading: skeleton y `aria-busy`. Responde a su contenedor (la cifra crece desde 20rem).
 * Estilos: src/styles/components/spotlight.css e indicator.css.
 */
export const Spotlight = /* @__PURE__ */ forwardRef<HTMLElement, SpotlightProps>(function Spotlight({
  label,
  value,
  unit,
  delta,
  context,
  children,
  tone,
  loading = false,
  emptyText,
  className,
  ...rest
}, ref) {
  const labelId = `gcu-spotlight-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const resolvedTone = resolveSurfaceTone('Spotlight', tone)
  const formattedDelta = formatDelta('Spotlight', delta)
  warnMissingContext('Spotlight', label, Boolean(formattedDelta) || hasIndicatorContent(context) || hasIndicatorContent(children))

  return (
    <section
      aria-labelledby={labelId}
      {...rest}
      ref={ref}
      className={cx('gcu-spotlight', `gcu-spotlight--${resolvedTone}`, 'gcu-grain', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <div className="gcu-spotlight__body">
        <p id={labelId} className="gcu-spotlight__label">{label}</p>
        <IndicatorValue value={value} unit={unit} loading={loading} className="gcu-spotlight__value" />
        {!loading && (formattedDelta || hasIndicatorContent(context) || !hasIndicatorContent(value)) && (
          <div className="gcu-spotlight__meta">
            {formattedDelta && <IndicatorDeltaChip delta={formattedDelta} label={delta?.label} valueClassName="gcu-spotlight__glass" />}
            <IndicatorContext value={value} context={context} emptyText={emptyText} />
          </div>
        )}
        {hasIndicatorContent(children) && !loading && <div className="gcu-spotlight__chart">{children}</div>}
      </div>
    </section>
  )
})
