import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import type { CitationProps } from '../../public/types'
import { Tooltip } from '../ui/Tooltip'
import { safeSourceHref } from './internal/safeSourceHref'

/**
 * Citation — marca de cita `[n]` en una respuesta, con vista previa de la fuente (Tooltip:
 * al pasar el puntero o al enfocar con teclado).
 *
 * - Con `targetId`: enlace que salta a la fuente en SourceList.
 * - Con `source.href` y sin `targetId`: enlace externo (nueva pestaña).
 * - Sin destino: botón enfocable solo para ver la vista previa.
 * - Nombre accesible «Fuente n: título».
 * Estilos: src/styles/components/ai-answer.css.
 */
export const Citation = /* @__PURE__ */ forwardRef<HTMLElement, CitationProps>(function Citation(
  { source, targetId, className, ...rest },
  ref,
) {
  const href = safeSourceHref(source.href)
  const name = `Fuente ${source.id}: ${source.title}`
  const preview = (
    <span className="gcu-ai-citation__preview">
      <strong>{source.title}</strong>
      {source.domain && <span className="gcu-ai-citation__domain"> · {source.domain}</span>}
      {source.excerpt && <span className="gcu-ai-citation__excerpt">{source.excerpt}</span>}
    </span>
  )
  const classes = cx('gcu-ai-citation', className)
  let trigger: React.ReactElement
  if (targetId || href) {
    const external = !targetId && Boolean(href)
    trigger = (
      <a
        {...rest}
        // SAFETY: el ref público es HTMLElement; aquí el nodo es un <a>.
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        href={targetId ? `#${targetId}` : href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={name}
      >
        {source.id}
      </a>
    )
  } else {
    trigger = (
      <button
        {...rest}
        // SAFETY: el ref público es HTMLElement; aquí el nodo es un <button>.
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        aria-label={name}
      >
        {source.id}
      </button>
    )
  }
  return <Tooltip content={preview}>{trigger}</Tooltip>
})
