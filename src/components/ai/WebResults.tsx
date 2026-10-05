import { forwardRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber, isNonEmptyString } from '../../utils/typeGuards'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { WebResultsProps } from '../../public/types'

/** Solo http(s): un `href` con otro esquema (javascript:, data:) no se renderiza como enlace. */
function safeHref(href: string | undefined): string | null {
  if (!isNonEmptyString(href)) return null
  if (/^https?:\/\//i.test(href)) return href
  log.warn('WebResults: se ignoró un enlace que no es http(s).')
  return null
}

/**
 * WebResults — búsqueda del asistente en la web o en la base de conocimiento: consulta, total,
 * resultados y cuál está leyendo.
 *
 * - Enlaces externos en pestaña nueva con aviso para lectores de pantalla; sin `href`, el título es texto.
 * - «Leyendo» en texto (Badge), no solo color.
 * - «Ver N más» despliega el resto. compact: sin extractos.
 * Estilos: src/styles/components/ai-web-results.css.
 */
export const WebResults = /* @__PURE__ */ forwardRef<HTMLDivElement, WebResultsProps>(function WebResults({
  query,
  results,
  total,
  compact = false,
  initialCount,
  scope,
  className,
  ...rest
}, ref) {
  const list = isArray(results) ? results : []
  if (!isArray(results)) log.warn('WebResults: `results` debe ser un arreglo; se muestra vacío.')
  const [expanded, setExpanded] = useState(false)
  const limit = isFiniteNumber(initialCount) && initialCount > 0 ? initialCount : compact ? 2 : 3
  const shown = expanded ? list : list.slice(0, limit)
  const count = isFiniteNumber(total) ? total : list.length

  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-web', compact && 'gcu-ai-web--compact', className)}>
      <p className="gcu-ai-web__query">
        <i className="feather-search gcu-ai-web__icon" aria-hidden="true" />
        <span className="gcu-ai-web__text">«{query}»</span>
        <span className="gcu-ai-web__count gcu-tabular">
          {count.toLocaleString('es-CL')} {count === 1 ? 'resultado' : 'resultados'}
          {scope !== undefined && scope !== null && <> en {scope}</>}
        </span>
      </p>
      {list.length === 0 ? (
        <p className="gcu-ai-web__empty">No hubo resultados para esta búsqueda. El asistente responderá sin fuentes externas y lo dirá.</p>
      ) : (
        <ul className="gcu-ai-web__list">
          {shown.map((item) => {
            const href = safeHref(item.href)
            return (
              <li key={`${item.domain}-${item.title}`} className={cx('gcu-ai-web__item', item.reading && 'gcu-ai-web__item--reading')}>
                <span className="gcu-ai-web__favicon" aria-hidden="true">{item.domain.charAt(0).toUpperCase()}</span>
                <span className="gcu-ai-web__body">
                  {href ? (
                    <a className="gcu-ai-web__title" href={href} target="_blank" rel="noreferrer">
                      {item.title}
                      <i className="feather-external-link gcu-ai-web__external" aria-hidden="true" />
                      <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
                    </a>
                  ) : (
                    <span className="gcu-ai-web__title">{item.title}</span>
                  )}
                  <span className="gcu-ai-web__domain">{item.domain}</span>
                  {!compact && item.snippet !== undefined && item.snippet !== null && <span className="gcu-ai-web__snippet">{item.snippet}</span>}
                </span>
                {item.reading && <Badge variant="primary" soft className="gcu-ai-web__reading">Leyendo</Badge>}
              </li>
            )
          })}
        </ul>
      )}
      {list.length > shown.length && (
        <Button variant="link" size="sm" className="gcu-ai-web__more" onClick={() => setExpanded(true)}>
          Ver {list.length - shown.length} más
        </Button>
      )}
    </div>
  )
})
