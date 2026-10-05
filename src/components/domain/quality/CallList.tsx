import { forwardRef, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isArray } from '../../../utils/typeGuards'
import type { CallId, CallListProps } from '../../../public/types'
import { CallRow } from './CallRow'
import { nextCallIndex } from './qualityModel'

const SKELETON_ROWS = ['a', 'b', 'c']

/**
 * CallList — bandeja de llamadas (patrón APG listbox de selección única).
 *
 * - Una sola parada de tabulación: la llamada activa (o la primera). Flechas arriba y abajo,
 *   Inicio y Fin mueven el foco; Enter o Espacio la abren (`onSelect`). El clic también.
 * - loading: skeleton y `aria-busy`. Vacía: `empty` o un texto que dice qué probar.
 * Estilos: src/styles/components/call-list.css.
 */
export const CallList = /* @__PURE__ */ forwardRef<HTMLDivElement, CallListProps>(function CallList({
  calls,
  activeId = null,
  onSelect,
  label = 'Llamadas',
  threshold,
  loading = false,
  empty,
  className,
  ...rest
}, ref) {
  const list = isArray(calls) ? calls : []
  if (!isArray(calls)) log.warn('CallList: `calls` debe ser un arreglo; se muestra la bandeja vacía.')
  const rows = useRef(new Map<CallId, HTMLDivElement>())
  const [focusedId, setFocusedId] = useState<CallId | null>(null)
  const activeIndex = list.findIndex((call) => call.id === activeId)
  const focusedIndex = list.findIndex((call) => call.id === focusedId)
  // Parada de tabulación: la que tiene el foco, si no la activa, si no la primera.
  const tabIndex = focusedIndex >= 0 ? focusedIndex : activeIndex >= 0 ? activeIndex : 0

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = list[tabIndex]
    if ((event.key === 'Enter' || event.key === ' ') && current) {
      event.preventDefault()
      onSelect?.(current.id)
      return
    }
    const next = nextCallIndex(event.key, tabIndex, list.length)
    const target = list[next]
    if (!target) return
    event.preventDefault()
    setFocusedId(target.id)
    rows.current.get(target.id)?.focus()
  }

  if (loading) {
    return (
      <div {...rest} ref={ref} className={cx('gcu-call-list', className)} aria-busy="true" aria-label={label} role="group">
        {SKELETON_ROWS.map((key) => <span key={key} className="gcu-skeleton gcu-call-list__skeleton" />)}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div {...rest} ref={ref} className={cx('gcu-call-list', 'gcu-call-list--empty', className)} role="status">
        {empty ?? 'No hay llamadas en esta bandeja. Prueba con otro filtro o periodo.'}
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="listbox"
      aria-label={label}
      className={cx('gcu-call-list', className)}
      onKeyDown={handleKeyDown}
    >
      {list.map((call, index) => (
        <CallRow
          key={call.id}
          ref={(node) => {
            if (node) rows.current.set(call.id, node)
            else rows.current.delete(call.id)
          }}
          call={call}
          active={call.id === activeId}
          tabIndex={index === tabIndex ? 0 : -1}
          threshold={threshold}
          onFocus={() => setFocusedId(call.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
})
