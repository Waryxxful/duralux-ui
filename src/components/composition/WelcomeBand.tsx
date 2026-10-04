import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isString } from '../../utils/typeGuards'
import type { WelcomeBandProps, WelcomeBandStat } from '../../public/types'
import { formatIndicatorValue, hasIndicatorContent, headingTag } from '../ui/internal/indicator'
import { resolveSurfaceTone } from './surfaceTone'

function statKey(stat: WelcomeBandStat, seen: Map<string, number>): string {
  const base = stat.id !== undefined ? `id:${String(stat.id)}` : isString(stat.label) ? `label:${stat.label}` : 'stat'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return `${base}~${count}`
}

/**
 * WelcomeBand — cabecera «qué atender primero»: nombra la tarea con su cifra y ofrece la acción.
 *
 * - **Una por página**, al inicio y junto a un Spotlight si hace falta. No saluda: «Cobranza tiene
 *   18 llamadas en espera», no «Hola, Camila».
 * - Superficie de color con grano (`.gcu-grain`) y texto blanco AA en los tres temas.
 * - actions: la acción de la vista. Sobre el relleno usa `variant="light"` (el tema la fija clara en
 *   claro y oscura en oscuro/navy; ambas contrastan con el relleno): un `btn-primary` se perdería.
 * - stats: 2–3 cifras de contexto (dl tabular). Responde a su contenedor: desde 42rem las cifras
 *   van a la derecha del texto.
 * Estilos: src/styles/components/welcome-band.css.
 */
export const WelcomeBand = /* @__PURE__ */ forwardRef<HTMLElement, WelcomeBandProps>(function WelcomeBand({
  eyebrow = 'Qué atender primero',
  title,
  lede,
  actions,
  stats,
  tone,
  headingLevel = 2,
  className,
  ...rest
}, ref) {
  const titleId = `gcu-welcome-band-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const resolvedTone = resolveSurfaceTone('WelcomeBand', tone)
  const Heading = headingTag(headingLevel, 'h2')
  const statList = isArray(stats) ? stats : []
  const seen = new Map<string, number>()

  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      ref={ref}
      className={cx('gcu-welcome-band', `gcu-welcome-band--${resolvedTone}`, 'gcu-grain', 'gcu-container', className)}
    >
      <div className="gcu-welcome-band__body">
        <div className="gcu-welcome-band__text">
          {hasIndicatorContent(eyebrow) && <p className="gcu-welcome-band__eyebrow">{eyebrow}</p>}
          <Heading id={titleId} className="gcu-welcome-band__title">{title}</Heading>
          {hasIndicatorContent(lede) && <p className="gcu-welcome-band__lede">{lede}</p>}
          {hasIndicatorContent(actions) && <div className="gcu-welcome-band__actions">{actions}</div>}
        </div>
        {statList.length > 0 && (
          <dl className="gcu-welcome-band__stats">
            {statList.map((stat) => (
              <div key={statKey(stat, seen)} className="gcu-welcome-band__stat">
                <dt>{stat.label}</dt>
                <dd className="gcu-tabular">{formatIndicatorValue(stat.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
})
