import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { AccordionItem, AccordionProps } from '../../public/types'
import { useIsomorphicLayoutEffect } from './internal/layoutEffect'

const EMPTY: ReadonlyArray<string> = []
const NAV_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

function nextOpenValues(current: ReadonlyArray<string>, value: string, multiple: boolean): string[] {
  const isOpen = current.includes(value)
  if (multiple) return isOpen ? current.filter((entry) => entry !== value) : [...current, value]
  return isOpen ? [] : [value]
}

interface PanelProps {
  id: string
  labelledBy: string
  open: boolean
  children: React.ReactNode
}

/**
 * Panel de una sección. Cerrado queda `inert` (fuera del orden de Tab y del árbol accesible) y
 * con altura 0; la altura se anima en CSS (`grid-template-rows`). `inert` se escribe en el DOM:
 * así funciona igual con React 18 y 19.
 */
function AccordionPanel({ id, labelledBy, open, children }: PanelProps) {
  const panelRef = useRef<HTMLElement | null>(null)
  useIsomorphicLayoutEffect(() => {
    panelRef.current?.toggleAttribute('inert', !open)
  }, [open])
  return (
    <section
      ref={panelRef}
      id={id}
      aria-labelledby={labelledBy}
      className="gcu-accordion__panel"
      data-state={open ? 'open' : 'closed'}
    >
      <div className="gcu-accordion__clip">
        <div className="gcu-accordion__body">{children}</div>
      </div>
    </section>
  )
}

/**
 * Accordion — secciones plegables (patrón APG «Accordion»).
 *
 * - Cada título es un `<button aria-expanded aria-controls>` dentro de un encabezado
 *   (`headingLevel`, h3 por defecto); el panel es una región nombrada por su botón.
 * - multiple: varias abiertas a la vez; si no, abrir una cierra la anterior (y se puede cerrar).
 * - Flechas arriba/abajo, Inicio y Fin recorren los títulos.
 * - Controlado (`value` + `onChange`) o no controlado (`defaultValue`).
 * - Altura animada en CSS; con reduced-motion es instantánea (tokens).
 */
export const Accordion = /* @__PURE__ */ forwardRef<HTMLDivElement, AccordionProps>(function Accordion({
  items,
  multiple = false,
  value,
  defaultValue,
  onChange,
  headingLevel = 3,
  flush = false,
  className,
  ...rest
}, ref) {
  const baseId = useId()
  const [uncontrolled, setUncontrolled] = useState<ReadonlyArray<string>>(defaultValue ?? EMPTY)
  const openValues = value ?? uncontrolled
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  // SAFETY: headingLevel está acotado a 2–6 por tipo; h2…h6 comparten las props de h3.
  const Heading = `h${headingLevel}` as 'h3'
  const enabledValues = useMemo(() => items.reduce<string[]>((values, item) => {
    if (!item.disabled) values.push(item.value)
    return values
  }, []), [items])
  const openSet = useMemo(() => new Set(openValues), [openValues])
  const tooManyOpen = !multiple && openValues.length > 1

  useEffect(() => {
    if (tooManyOpen) log.warn('Accordion: hay varias secciones abiertas sin `multiple`; pasa `multiple` o abre solo una.')
  }, [tooManyOpen])

  const toggle = (item: AccordionItem) => {
    if (item.disabled) return
    const next = nextOpenValues(openValues, item.value, multiple)
    if (value === undefined) setUncontrolled(next)
    onChange?.(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, item: AccordionItem) => {
    if (!NAV_KEYS.has(event.key) || enabledValues.length === 0) return
    event.preventDefault()
    const position = enabledValues.indexOf(item.value)
    const last = enabledValues.length - 1
    const target = event.key === 'Home' ? 0
      : event.key === 'End' ? last
        : event.key === 'ArrowDown' ? (position + 1) % enabledValues.length
          : (position - 1 + enabledValues.length) % enabledValues.length
    triggerRefs.current.get(enabledValues[target])?.focus()
  }

  return (
    <div {...rest} ref={ref} className={cx('gcu-accordion', flush && 'gcu-accordion--flush', className)}>
      {items.map((item) => {
        const open = openSet.has(item.value)
        const triggerId = `${baseId}-${item.value}-trigger`
        const panelId = `${baseId}-${item.value}-panel`
        return (
          <div key={item.value} className="gcu-accordion__item" data-state={open ? 'open' : 'closed'}>
            <Heading className="gcu-accordion__heading">
              <button
                ref={(node) => {
                  if (node) triggerRefs.current.set(item.value, node)
                  else triggerRefs.current.delete(item.value)
                }}
                id={triggerId}
                type="button"
                className="gcu-accordion__trigger"
                aria-expanded={open}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item)}
                onKeyDown={(event) => handleKeyDown(event, item)}
              >
                <span className="gcu-accordion__title">{item.title}</span>
                <i className="feather-chevron-down gcu-accordion__chevron" aria-hidden="true" />
              </button>
            </Heading>
            <AccordionPanel id={panelId} labelledBy={triggerId} open={open}>{item.content}</AccordionPanel>
          </div>
        )
      })}
    </div>
  )
})
