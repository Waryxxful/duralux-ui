import { forwardRef, useId, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isFunction } from '../../utils/typeGuards'
import type { MemoryChipsProps } from '../../public/types'
import { Button } from '../ui/Button'
import { Tag } from '../ui/Tag'

/**
 * MemoryChips — lo que el asistente recuerda de la persona o del equipo; cada recuerdo se puede olvidar.
 *
 * - Cada recuerdo es un Tag con «Olvidar: …» (botón real). Olvidar y agregar solo emiten la intención.
 * - panel: título con el total y formulario para agregar. row: solo los chips.
 * - El texto de los recuerdos nunca va a logs.
 * Estilos: src/styles/components/ai-memory.css.
 */
export const MemoryChips = /* @__PURE__ */ forwardRef<HTMLElement, MemoryChipsProps>(function MemoryChips(
  { items, onRemove, onAdd, variant = 'panel', className, ...rest },
  ref,
) {
  const [draft, setDraft] = useState('')
  const titleId = useId()
  const chips = items.length > 0
    ? (
      <ul className="gcu-ai-memory__chips" aria-label={variant === 'row' ? 'Memoria del asistente' : undefined}>
        {items.map((item) => (
          <li key={item.id}>
            <Tag
              size="sm"
              onRemove={isFunction(onRemove) ? () => onRemove(item.id) : undefined}
              removeLabel={`Olvidar: ${item.text}`}
            >
              {item.text}
            </Tag>
          </li>
        ))}
      </ul>
    )
    : <p className="gcu-ai-memory__empty">El asistente todavía no recuerda nada de ti.</p>

  if (variant === 'row') {
    return (
      // SAFETY: el ref público es HTMLElement; en fila la raíz es un <div>.
      <div {...rest} ref={ref as React.Ref<HTMLDivElement>} className={cx('gcu-ai-memory', 'gcu-ai-memory--row', className)}>
        {chips}
      </div>
    )
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !isFunction(onAdd)) return
    onAdd(text)
    setDraft('')
  }

  return (
    <section {...rest} ref={ref} aria-labelledby={titleId} className={cx('gcu-ai-memory', 'gcu-container', className)}>
      <div className="gcu-ai-memory__header">
        <h3 id={titleId} className="gcu-ai-memory__title">Memoria del asistente</h3>
        <span className="gcu-ai-memory__count">{items.length.toLocaleString('es-CL')} {items.length === 1 ? 'recuerdo' : 'recuerdos'}</span>
      </div>
      {chips}
      {isFunction(onAdd) && (
        <form className="gcu-ai-memory__form" onSubmit={submit}>
          <input
            className="form-control form-control-sm"
            value={draft}
            maxLength={200}
            placeholder="Algo que deba recordar, p. ej. «Mi campaña es Cobranza Norte»"
            aria-label="Nuevo recuerdo"
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button type="submit" variant="light-brand" size="sm" disabled={!draft.trim()}>Agregar</Button>
        </form>
      )}
    </section>
  )
})
