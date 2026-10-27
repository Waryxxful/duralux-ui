import { Fragment, forwardRef, useEffect, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isArray, isNonEmptyString } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'
import type { ActionMenuProps } from '../../public/types'
import { Dropdown, DropdownMenu } from './Dropdown'

type FocusTarget = 'first' | 'last'

function enabledItems(menu: HTMLElement | null): HTMLButtonElement[] {
  if (!menu) return []
  return Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])'))
}

/**
 * ActionMenu — botón «⋯» con las acciones de una fila o tarjeta (patrón APG menu button).
 *
 * - Botón cuadrado sin fondo (32 px `sm` o 36 px `md`) con `label` como nombre accesible y `title`.
 * - Menú `role="menu"` con ítems `menuitem`: ↑/↓, Inicio y Fin recorren los habilitados; ↓/↑ sobre el
 *   botón abren el menú en el primero o el último. Esc cierra y devuelve el foco al botón.
 * - Elegir un ítem cierra el menú, devuelve el foco y llama `onSelect`. Los deshabilitados no se eligen.
 * - `tone="danger"` pinta el ítem en rojo; `separatorBefore` lo separa con una línea.
 * - El ref apunta al `div` raíz. Estilos: src/styles/components/action-menu.css.
 */
export const ActionMenu = /* @__PURE__ */ forwardRef<HTMLDivElement, ActionMenuProps>(function ActionMenu({
  items,
  label,
  align = 'end',
  size = 'sm',
  icon = 'more-horizontal',
  disabled = false,
  className,
  ...rest
}, ref) {
  const list = isArray(items) ? items : []
  const [open, setOpen] = useState(false)
  const [focusTarget, setFocusTarget] = useState<FocusTarget>('first')
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)
  const baseId = `gcu-action-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  // Al abrir, el foco pasa al primer (o último) ítem habilitado.
  useEffect(() => {
    if (!open) return
    const enabled = enabledItems(menuRef.current)
    const target = focusTarget === 'last' ? enabled[enabled.length - 1] : enabled[0]
    target?.focus()
  }, [open, focusTarget])

  function openAt(target: FocusTarget) {
    setFocusTarget(target)
    setOpen(true)
  }

  function closeAndRestore() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const enabled = enabledItems(menuRef.current)
    if (enabled.length === 0) return
    const current = enabled.findIndex((item) => item === document.activeElement)
    let next: number | null = null
    if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % enabled.length
    else if (event.key === 'ArrowUp') next = current < 0 ? enabled.length - 1 : (current - 1 + enabled.length) % enabled.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = enabled.length - 1
    else if (event.key === 'Tab') setOpen(false)
    if (next === null) return
    event.preventDefault()
    enabled[next]?.focus()
  }

  return (
    <Dropdown
      {...rest}
      ref={ref}
      className={cx('dropdown', 'gcu-action-menu', className)}
      align={align}
      open={open && !disabled}
      onOpenChange={(next) => {
        if (next) setFocusTarget('first')
        setOpen(next)
      }}
      trigger={({ ref: triggerCallbackRef, ...triggerProps }) => (
        <button
          {...triggerProps}
          ref={(node) => {
            triggerRef.current = node
            triggerCallbackRef(node)
          }}
          className={cx('btn', 'btn-icon', size === 'sm' && 'btn-sm', 'gcu-action-menu__trigger', `gcu-action-menu__trigger--${size}`)}
          aria-label={label}
          aria-haspopup="menu"
          title={label}
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              openAt(event.key === 'ArrowUp' ? 'last' : 'first')
            }
          }}
        >
          {renderIconSlot(icon, { className: 'gcu-action-menu__trigger-icon' })}
        </button>
      )}
    >
      <DropdownMenu
        ref={menuRef}
        role="menu"
        className="gcu-action-menu__menu"
        closeOnSelect={false}
        onKeyDown={handleMenuKeyDown}
      >
        {list.map((item, index) => {
          const itemId = `${baseId}-${index}`
          const danger = item.tone === 'danger'
          const hasDescription = item.description !== undefined && item.description !== null && item.description !== ''
          return (
            <Fragment key={item.key ?? index}>
              {item.separatorBefore && index > 0 && <div role="separator" className="dropdown-divider gcu-action-menu__separator" />}
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={cx(
                  'dropdown-item',
                  'gcu-action-menu__item',
                  danger && 'gcu-dropdown-item--danger gcu-action-menu__item--danger',
                )}
                disabled={item.disabled}
                aria-disabled={item.disabled || undefined}
                aria-labelledby={`${itemId}-label`}
                aria-describedby={hasDescription ? `${itemId}-description` : undefined}
                onClick={() => {
                  if (item.disabled) return
                  closeAndRestore()
                  item.onSelect()
                }}
              >
                {renderIconSlot(item.icon, { className: 'gcu-action-menu__icon' })}
                <span className="gcu-action-menu__body">
                  <span id={`${itemId}-label`} className="gcu-action-menu__label">{item.label}</span>
                  {hasDescription && (
                    <span id={`${itemId}-description`} className="gcu-action-menu__description">{item.description}</span>
                  )}
                </span>
                {isNonEmptyString(item.shortcut) && (
                  <span className="gcu-action-menu__shortcut" aria-hidden="true">{item.shortcut}</span>
                )}
              </button>
            </Fragment>
          )
        })}
      </DropdownMenu>
    </Dropdown>
  )
})
