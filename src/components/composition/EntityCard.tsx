import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFunction, isString } from '../../utils/typeGuards'
import type { EntityCardProps, EntityCardStat } from '../../public/types'
import { Avatar } from '../ui/Avatar'
import { formatIndicatorValue, hasIndicatorContent } from '../ui/internal/indicator'

function statKey(stat: EntityCardStat, seen: Map<string, number>): string {
  const base = stat.id !== undefined ? `id:${String(stat.id)}` : isString(stat.label) ? `label:${stat.label}` : 'stat'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return `${base}~${count}`
}

/**
 * EntityCard — tarjeta de entidad para el patrón Directorio (cliente, campaña, agente).
 *
 * - Marca (avatar con iniciales o foto, o `mark` propia), título, subtítulo, cifras (dl tabular),
 *   chips de estado y pie.
 * - href u onClick: el título es el enlace o botón y su área cubre la card (un solo tabulador);
 *   el pie queda por encima para sus propias acciones. Hover con elevación 2 solo con puntero.
 * - inactive: se atenúa y anuncia «Inactiva» en texto.
 * Estilos: src/styles/components/entity-card.css.
 */
export const EntityCard = /* @__PURE__ */ forwardRef<HTMLElement, EntityCardProps>(function EntityCard({
  title,
  subtitle,
  name,
  mark,
  src = null,
  stats,
  chips,
  footer,
  inactive = false,
  href,
  onClick,
  headingLevel = 3,
  className,
  ...rest
}, ref) {
  const Heading = `h${headingLevel}` as 'h3'
  const interactive = Boolean(href) || isFunction(onClick)
  const statList = isArray(stats) ? stats : []
  const seen = new Map<string, number>()
  const avatarName = name ?? (isString(title) ? title : '')
  let titleNode = title
  if (href) titleNode = <a className="gcu-entity-card__link" href={href} onClick={onClick}>{title}</a>
  else if (isFunction(onClick)) titleNode = <button type="button" className="gcu-entity-card__link" onClick={onClick}>{title}</button>

  return (
    <article
      {...rest}
      ref={ref}
      className={cx('card', 'gcu-entity-card', 'gcu-container', interactive && 'gcu-entity-card--interactive', inactive && 'gcu-entity-card--inactive', className)}
    >
      <div className="card-body gcu-entity-card__body">
        <div className="gcu-entity-card__head">
          {hasIndicatorContent(mark)
            ? <span className="gcu-entity-card__mark" aria-hidden="true">{mark}</span>
            : <Avatar name={avatarName} src={src} size="lg" variant={inactive ? 'secondary' : 'primary'} />}
          <div className="gcu-entity-card__titles">
            <Heading className="gcu-entity-card__title">{titleNode}</Heading>
            {(hasIndicatorContent(subtitle) || inactive) && (
              <p className="gcu-entity-card__subtitle">
                {inactive && <span className="gcu-entity-card__inactive">Inactiva</span>}
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {statList.length > 0 && (
          <dl className="gcu-entity-card__stats">
            {statList.map((stat) => (
              <div key={statKey(stat, seen)} className="gcu-entity-card__stat">
                <dt>{stat.label}</dt>
                <dd className="gcu-tabular">{formatIndicatorValue(stat.value)}</dd>
              </div>
            ))}
          </dl>
        )}
        {hasIndicatorContent(chips) && <div className="gcu-entity-card__chips">{chips}</div>}
      </div>
      {hasIndicatorContent(footer) && <div className="card-footer gcu-entity-card__footer">{footer}</div>}
    </article>
  )
})
