import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFunction, isString } from '../../utils/typeGuards'
import type { QuickTile, QuickTilesProps } from '../../public/types'
import { hasIndicatorContent, headingTag, resolveTone } from '../ui/internal/indicator'
import { IndicatorGlyph } from '../ui/internal/IndicatorParts'

function tileKey(tile: QuickTile, seen: Map<string, number>): string {
  const base = tile.id !== undefined ? `id:${String(tile.id)}` : tile.href ? `href:${tile.href}` : isString(tile.label) ? `label:${tile.label}` : 'tile'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return `${base}~${count}`
}

function TileBody({ tile }: { tile: QuickTile }) {
  const tone = resolveTone('QuickTiles', tile.tone, undefined, 'primary')
  return (
    <>
      {tile.icon && (
        <span className={cx('gcu-stat__icon', `gcu-stat__icon--${tone}`, 'gcu-quick-tiles__icon')}>
          <IndicatorGlyph icon={tile.icon} />
        </span>
      )}
      <span className="gcu-quick-tiles__text">
        <span className="gcu-quick-tiles__label">{tile.label}</span>
        {hasIndicatorContent(tile.description) && <span className="gcu-quick-tiles__description">{tile.description}</span>}
        {tile.disabled && hasIndicatorContent(tile.disabledReason) && (
          <span className="gcu-quick-tiles__reason">{tile.disabledReason}</span>
        )}
      </span>
    </>
  )
}

/**
 * QuickTiles — accesos a tareas frecuentes de un directorio, en una card plana.
 *
 * - Cada tile es un enlace (`href`) o un botón (`onClick`) con ícono suave por tono, etiqueta
 *   que empieza con verbo («Crear campaña») y descripción opcional.
 * - disabled + disabledReason: el motivo se muestra en texto (REGLAS §6).
 * - Responde a su contenedor: 1 columna en angosto, 2 desde 24rem, 3 desde 36rem y 4 desde 48rem.
 *   Hover instantáneo solo con puntero; presión `scale(0.98)`.
 * Estilos: src/styles/components/quick-tiles.css e indicator.css.
 */
export const QuickTiles = /* @__PURE__ */ forwardRef<HTMLElement, QuickTilesProps>(function QuickTiles({
  items,
  title,
  headingLevel = 3,
  className,
  ...rest
}, ref) {
  const titleId = `gcu-quick-tiles-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const list = isArray(items) ? items : []
  const seen = new Map<string, number>()
  const Heading = headingTag(headingLevel, 'h3')
  const hasTitle = hasIndicatorContent(title)

  return (
    <section
      {...rest}
      ref={ref}
      aria-labelledby={hasTitle ? titleId : rest['aria-labelledby']}
      className={cx('card', 'gcu-quick-tiles', 'gcu-container', className)}
    >
      {hasTitle && (
        <div className="card-header">
          <Heading id={titleId} className="card-title gcu-quick-tiles__title">{title}</Heading>
        </div>
      )}
      <div className="card-body">
        <ul className="gcu-quick-tiles__grid">
          {list.map((tile) => (
            <li key={tileKey(tile, seen)} className="gcu-quick-tiles__item">
              {tile.href && !tile.disabled ? (
                <a className="gcu-quick-tiles__tile" href={tile.href} onClick={tile.onClick}><TileBody tile={tile} /></a>
              ) : (
                <button
                  type="button"
                  className="gcu-quick-tiles__tile"
                  disabled={tile.disabled || !isFunction(tile.onClick)}
                  onClick={tile.onClick}
                >
                  <TileBody tile={tile} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
})
