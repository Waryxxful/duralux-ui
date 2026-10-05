import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import type { AiHistoryProps, AiThread } from '../../public/types'
import { Button } from '../ui/Button'

const SKELETON = ['a', 'b', 'c', 'd']

function groupThreads(threads: ReadonlyArray<AiThread>): Array<[string, AiThread[]]> {
  const groups = new Map<string, AiThread[]>()
  const pinned = threads.filter((t) => t.pinned)
  if (pinned.length > 0) groups.set('Fijadas', pinned)
  for (const thread of threads) {
    if (thread.pinned) continue
    const list = groups.get(thread.group) ?? []
    list.push(thread)
    groups.set(thread.group, list)
  }
  return [...groups.entries()]
}

/**
 * AiHistory — conversaciones anteriores con el asistente, agrupadas por fecha y con las fijadas arriba.
 *
 * - `nav` con nombre; cada grupo es una lista con su encabezado; la activa lleva `aria-current`.
 * - onNew: «Nueva conversación» arriba. loading: skeleton con `aria-busy`. Vacío: lo dice.
 * Estilos: src/styles/components/ai-history.css.
 */
export const AiHistory = /* @__PURE__ */ forwardRef<HTMLElement, AiHistoryProps>(function AiHistory(
  { threads, activeId, onSelect, onNew, compact = false, loading = false, emptyText = 'Todavía no tienes conversaciones. Haz tu primera pregunta.', className, ...rest },
  ref,
) {
  const uid = useId().replace(/:/g, '')
  return (
    <nav
      {...rest}
      ref={ref}
      aria-label={rest['aria-label'] ?? 'Conversaciones anteriores'}
      aria-busy={loading || undefined}
      className={cx('gcu-ai-history', compact && 'gcu-ai-history--compact', className)}
    >
      {onNew && (
        <Button variant="light-brand" size="sm" startIcon="plus" className="gcu-ai-history__new" onClick={onNew}>
          Nueva conversación
        </Button>
      )}
      {loading && (
        <ul className="gcu-ai-history__list" aria-hidden="true">
          {SKELETON.map((row) => <li key={row} className="gcu-ai-history__skeleton"><span className="gcu-skeleton gcu-skeleton--text" /></li>)}
        </ul>
      )}
      {!loading && threads.length === 0 && <p className="gcu-ai-history__empty">{emptyText}</p>}
      {!loading && groupThreads(threads).map(([group, list], index) => {
        const headingId = `gcu-ai-history-${uid}-${index}`
        return (
          <div key={group} className="gcu-ai-history__group">
            <p id={headingId} className="gcu-ai-history__heading">{group}</p>
            <ul className="gcu-ai-history__list" aria-labelledby={headingId}>
              {list.map((thread) => {
                const active = thread.id === activeId
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      className={cx('gcu-ai-history__item', active && 'gcu-ai-history__item--active')}
                      aria-current={active ? 'true' : undefined}
                      onClick={() => onSelect(thread.id)}
                    >
                      {thread.pinned && <><i className="feather-bookmark" aria-hidden="true" /><span className="visually-hidden">Fijada: </span></>}
                      <span className="gcu-ai-history__title">{thread.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
})
