import { forwardRef, useCallback, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFunction } from '../../utils/typeGuards'
import type { ListItem, ListProps } from '../../public/types'
import { firstEnabledIndex, nextEnabledIndex, toggleSelection, typeaheadIndex, type ListId } from './listModel'

const SKELETON_ROWS = ['a', 'b', 'c']
const TYPEAHEAD_RESET_MS = 500

function ItemBody({ item }: { item: ListItem }) {
  return (
    <>
      {item.leading !== undefined && item.leading !== null && <span className="gcu-list__leading">{item.leading}</span>}
      <span className="gcu-list__content">
        <span className="gcu-list__title">
          {item.unread && (
            <>
              <span className="gcu-list__unread" aria-hidden="true" />
              <span className="visually-hidden">Sin leer: </span>
            </>
          )}
          {item.title}
        </span>
        {item.meta !== undefined && item.meta !== null && <span className="gcu-list__meta">{item.meta}</span>}
      </span>
      {item.trailing !== undefined && item.trailing !== null && <span className="gcu-list__trailing">{item.trailing}</span>}
    </>
  )
}

function EmptyList({ empty }: { empty: React.ReactNode }) {
  return (
    <div className="gcu-list__empty" role="status">
      {empty ?? 'No hay elementos para mostrar. Prueba con otros filtros.'}
    </div>
  )
}

/**
 * List — lista de entidades con avatar o ícono, meta y cifra o estado.
 *
 * - Sin selección: `ul.list-group.list-group-flush`; una fila con `onClick` es un botón y con `href`, un enlace.
 * - selectionMode `single` | `multiple`: patrón APG listbox con foco itinerante. Flechas, Inicio/Fin,
 *   Espacio/Enter para seleccionar, búsqueda por tipeo y Ctrl+A (múltiple). Controlada con
 *   `selectedIds` o no controlada con `defaultSelectedIds`; avisa cada cambio con `onSelectionChange`.
 * - unread: punto + «Sin leer» para lectores de pantalla. loading: skeleton y `aria-busy`.
 * Estilos: src/styles/components/list.css.
 */
export const List = /* @__PURE__ */ forwardRef<HTMLElement, ListProps>(function List({
  items,
  label,
  selectionMode = 'none',
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  density = 'default',
  loading = false,
  empty,
  className,
  ...rest
}, ref) {
  const list = isArray(items) ? items : []
  const selectable = selectionMode === 'single' || selectionMode === 'multiple'
  const [innerSelection, setInnerSelection] = useState<ListId[]>(() => [...(defaultSelectedIds ?? [])])
  const selection: ReadonlyArray<ListId> = selectedIds ?? innerSelection
  const [activeIndex, setActiveIndex] = useState(-1)
  const optionRefs = useRef(new Map<ListId, HTMLLIElement>())
  const typeahead = useRef({ query: '', at: 0 })

  if (selectable && !label && !rest['aria-label'] && !rest['aria-labelledby']) {
    log.warn('List: una lista seleccionable necesita `label` (nombre accesible del listbox).')
  }

  const commit = useCallback((next: ListId[]) => {
    if (selectedIds === undefined) setInnerSelection(next)
    if (isFunction(onSelectionChange)) onSelectionChange(next)
  }, [onSelectionChange, selectedIds])

  const focusIndex = (index: number) => {
    const item = list[index]
    if (!item) return
    setActiveIndex(index)
    optionRefs.current.get(item.id)?.focus()
  }

  const activate = (item: ListItem) => {
    if (item.disabled || !selectable) return
    commit(toggleSelection(selection, item.id, selectionMode))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (!selectable || list.length === 0) return
    const current = activeIndex >= 0 ? activeIndex : firstEnabledIndex(list)
    let next = -1
    switch (event.key) {
      case 'ArrowDown': next = nextEnabledIndex(list, current, 1); break
      case 'ArrowUp': next = nextEnabledIndex(list, current, -1); break
      case 'Home': next = firstEnabledIndex(list); break
      case 'End': next = firstEnabledIndex(list, true); break
      case ' ':
      case 'Enter': {
        event.preventDefault()
        const item = list[current]
        if (item) activate(item)
        return
      }
      default: {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && selectionMode === 'multiple') {
          event.preventDefault()
          const enabled = list.filter((item) => !item.disabled).map((item) => item.id)
          commit(enabled.every((id) => selection.includes(id)) ? [] : enabled)
          return
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const now = event.timeStamp
          const state = typeahead.current
          state.query = now - state.at > TYPEAHEAD_RESET_MS ? event.key : state.query + event.key
          state.at = now
          next = typeaheadIndex(list, current, state.query)
        }
      }
    }
    if (next >= 0) {
      event.preventDefault()
      focusIndex(next)
    }
  }

  const rootClass = cx('gcu-list', `gcu-list--${density}`, 'list-group', 'list-group-flush', className)

  if (loading) {
    return (
      <ul {...rest} ref={ref as React.Ref<HTMLUListElement>} className={rootClass} aria-busy="true" aria-label={label ?? rest['aria-label']}>
        {SKELETON_ROWS.map((row) => (
          <li key={`skeleton-${row}`} className="list-group-item gcu-list__item" aria-hidden="true">
            <span className="gcu-skeleton gcu-skeleton--circle gcu-list__skeleton-avatar" />
            <span className="gcu-list__content"><span className="gcu-skeleton gcu-skeleton--text" /></span>
          </li>
        ))}
        <li className="visually-hidden">Cargando</li>
      </ul>
    )
  }

  if (list.length === 0) {
    return (
      <div {...rest} ref={ref as React.Ref<HTMLDivElement>} className={cx('gcu-list', 'gcu-list--empty', className)}>
        <EmptyList empty={empty} />
      </div>
    )
  }

  if (!selectable) {
    return (
      <ul {...rest} ref={ref as React.Ref<HTMLUListElement>} className={rootClass} aria-label={label ?? rest['aria-label']}>
        {list.map((item) => {
          let body: React.ReactNode = <ItemBody item={item} />
          if (item.href && !item.disabled) {
            body = <a className="gcu-list__action" href={item.href} aria-current={item.active ? 'page' : undefined} onClick={item.onClick}>{body}</a>
          } else if (isFunction(item.onClick)) {
            body = <button type="button" className="gcu-list__action" disabled={item.disabled} aria-current={item.active || undefined} onClick={item.onClick}>{body}</button>
          }
          const interactive = Boolean(item.href || isFunction(item.onClick))
          return (
            <li
              key={item.id}
              className={cx('list-group-item', 'gcu-list__item', interactive && 'gcu-list__item--interactive', item.active && 'gcu-list__item--active', item.disabled && 'gcu-list__item--disabled')}
            >
              {body}
            </li>
          )
        })}
      </ul>
    )
  }

  const tabStop = activeIndex >= 0 && list[activeIndex] && !list[activeIndex].disabled
    ? activeIndex
    : Math.max(0, list.findIndex((item) => selection.includes(item.id) && !item.disabled), firstEnabledIndex(list))

  return (
    <ul
      {...rest}
      ref={ref as React.Ref<HTMLUListElement>}
      role="listbox"
      aria-label={label ?? rest['aria-label']}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={cx(rootClass, 'gcu-list--selectable')}
      onKeyDown={handleKeyDown}
    >
      {list.map((item, index) => {
        const selected = selection.includes(item.id)
        return (
          <li
            key={item.id}
            ref={(node) => {
              if (node) optionRefs.current.set(item.id, node)
              else optionRefs.current.delete(item.id)
            }}
            role="option"
            aria-selected={selected}
            aria-disabled={item.disabled || undefined}
            tabIndex={index === tabStop ? 0 : -1}
            className={cx('list-group-item', 'gcu-list__item', 'gcu-list__item--interactive', selected && 'gcu-list__item--selected', item.disabled && 'gcu-list__item--disabled')}
            onClick={() => {
              if (item.disabled) return
              setActiveIndex(index)
              activate(item)
            }}
            onFocus={() => setActiveIndex(index)}
          >
            <span className={cx('gcu-list__check', selectionMode === 'single' && 'gcu-list__check--radio')} aria-hidden="true" />
            <ItemBody item={item} />
          </li>
        )
      })}
    </ul>
  )
})
