import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import type { SourceListProps } from '../../public/types'
import { safeHref } from '../../utils/safeHref'

/**
 * SourceList — fuentes (notas al pie) de una respuesta del asistente, numeradas como sus citas `[n]`.
 *
 * - idPrefix: cada fuente lleva id `<prefijo>-<n>` para que Citation salte a ella.
 * - Sin fuentes, lo dice (regla de IA: una respuesta sin fuente no se presenta como respaldada).
 * - Enlaces externos en otra pestaña con `rel="noopener noreferrer"`.
 * Estilos: src/styles/components/ai-answer.css.
 */
export const SourceList = /* @__PURE__ */ forwardRef<HTMLElement, SourceListProps>(function SourceList(
  { sources, idPrefix, label = 'Fuentes', emptyText = 'Esta respuesta no cita fuentes. Verifica los datos antes de usarlos.', className, ...rest },
  ref,
) {
  if (sources.length === 0) {
    return (
      // SAFETY: el ref público es HTMLElement; vacío, la raíz es un <p>.
      <p {...rest} ref={ref as React.Ref<HTMLParagraphElement>} className={cx('gcu-ai-sources', 'gcu-ai-sources--empty', className)}>
        <i className="feather-info" aria-hidden="true" /> {emptyText}
      </p>
    )
  }
  return (
    // SAFETY: el ref público es HTMLElement; la raíz es un <ol>.
    <ol {...rest} ref={ref as React.Ref<HTMLOListElement>} className={cx('gcu-ai-sources', className)} aria-label={label}>
      {sources.map((source) => {
        const href = safeHref(source.href)
        return (
        <li key={source.id} id={idPrefix ? `${idPrefix}-${source.id}` : undefined} className="gcu-ai-sources__item" tabIndex={idPrefix ? -1 : undefined}>
          <span className="gcu-ai-sources__n" aria-hidden="true">{source.id}</span>
          <span className="gcu-ai-sources__body">
            {href
              ? <a className="gcu-ai-sources__title" href={href} target="_blank" rel="noopener noreferrer">{source.title}<span className="visually-hidden"> (se abre en otra pestaña)</span></a>
              : <span className="gcu-ai-sources__title">{source.title}</span>}
            {source.domain && <span className="gcu-ai-sources__domain"> · {source.domain}</span>}
            {source.excerpt && <span className="gcu-ai-sources__excerpt">{source.excerpt}</span>}
          </span>
        </li>
        )
      })}
    </ol>
  )
})
