import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { assignRef } from '../../utils/assignRef'
import { isFunction } from '../../utils/typeGuards'
import { registerDismissableLayer } from '../../utils/dismissableLayer'
import { useThemeBoundaryMode } from '../../theme/themeBoundary'
import type { DrawerProps } from '../../public/types'
import { animationDurationMs, useIsClient } from './internal/layoutEffect'
import {
  focusDialog,
  getFocusableElements,
  isTopmostModal,
  registerModal,
  restoreFocus,
  syncModalBackground,
  unregisterModal,
} from './internal/modalStack'

const SIZES = new Set(['sm', 'md', 'lg'])

interface DrawerStackEntry {
  dialog: HTMLElement | null
  backdrop: null
  previousFocus: Element | null
}

function hasContent(value: React.ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== ''
}

/** Trampa de Tab dentro del panel superior de la pila (misma regla que Modal). */
function trapTab(event: KeyboardEvent, entry: { dialog: HTMLElement | null }) {
  if (event.key !== 'Tab' || !isTopmostModal(entry) || !entry.dialog) return
  const focusable = getFocusableElements(entry.dialog)
  if (focusable.length === 0) {
    event.preventDefault()
    entry.dialog.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = entry.dialog.ownerDocument.activeElement
  const inSequence = focusable.some((element) => element === active)
  if (event.shiftKey && (active === first || !inSequence)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || !inSequence)) {
    event.preventDefault()
    first.focus()
  }
}

/**
 * Drawer — panel lateral modal: detalle rápido, filtros avanzados, edición sin salir de la lista.
 *
 * - `<dialog open aria-modal="true">` sobre la misma pila que Modal: foco atrapado, foco inicial en
 *   el primer control y retorno al abridor, Esc cierra (solo el de arriba), el fondo queda inert y
 *   el body no se desplaza.
 * - Overlay con `--gcu-overlay`; z-index `--gcu-z-drawer` (bajo Modal, que puede abrirse encima).
 * - size: sm (24rem), md (32rem), lg (48rem); nunca más ancho que la pantalla. side: `end` | `start`.
 * - Cabecera y pie fijos; el cuerpo se desplaza y es contenedor de consultas (formularios a 2 columnas
 *   desde 28rem).
 * - Entra con `gcu-enter` y sale más rápido (`--gcu-duration-fast`). El foco y el fondo se liberan al
 *   empezar la salida (mismo tick que Modal); el panel se desmonta al terminar la animación.
 * - El ref apunta al `<dialog>`.
 */
export const Drawer = /* @__PURE__ */ forwardRef<HTMLDialogElement, DrawerProps>(function Drawer({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  side = 'end',
  closeOnEscape = true,
  closeOnBackdrop = true,
  className,
  'aria-label': ariaLabel,
  ...rest
}, forwardedRef) {
  const baseId = useId()
  const titleId = `${baseId}-title`
  const descriptionId = `${baseId}-description`
  const themeMode = useThemeBoundaryMode()
  const mounted = useIsClient()
  const [rendered, setRendered] = useState(open)
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const entryRef = useRef<DrawerStackEntry>({ dialog: null, backdrop: null, previousFocus: null })
  const onCloseRef = useRef(onClose)
  const closeOnEscapeRef = useRef(closeOnEscape)
  const canClose = isFunction(onClose)
  const hasTitle = hasContent(title)
  const hasDescription = hasContent(description)
  const resolvedSize = SIZES.has(size) ? size : 'md'

  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node
    assignRef(forwardedRef, node)
  }, [forwardedRef])

  useEffect(() => {
    onCloseRef.current = onClose
    closeOnEscapeRef.current = closeOnEscape
  }, [onClose, closeOnEscape])

  useEffect(() => {
    if (!SIZES.has(size)) log.warn(`Drawer: size "${String(size)}" no existe; se usa md.`)
    if (!hasTitle && !ariaLabel) log.warn('Drawer sin nombre accesible: pasa `title` o `aria-label`.')
  }, [ariaLabel, hasTitle, size])

  // Montaje y salida: abre al instante; al cerrar espera la animación de salida y desmonta.
  useEffect(() => {
    if (open) {
      setRendered(true)
      return undefined
    }
    const wait = animationDurationMs(dialogRef.current)
    if (wait === 0) {
      setRendered(false)
      return undefined
    }
    const timer = setTimeout(() => setRendered(false), wait + 50)
    return () => clearTimeout(timer)
  }, [open])

  // Pila modal: fondo inert, scroll bloqueado, foco inicial, Esc y retorno de foco.
  useEffect(() => {
    if (!open || !mounted || !dialogRef.current) return undefined
    const entry = entryRef.current
    entry.dialog = dialogRef.current
    entry.previousFocus = document.activeElement
    registerModal(entry)
    const unregisterLayer = registerDismissableLayer({
      element: entry.dialog,
      onEscape: () => {
        if (closeOnEscapeRef.current) onCloseRef.current?.()
      },
    })
    const observer = isFunction(globalThis.MutationObserver)
      ? new MutationObserver(() => syncModalBackground())
      : null
    observer?.observe(document.body, { childList: true, attributes: true, subtree: true, attributeFilter: ['aria-hidden', 'inert'] })
    focusDialog(entry.dialog)
    const handleKeyDown = (event: KeyboardEvent) => trapTab(event, entry)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      observer?.disconnect()
      unregisterLayer()
      const { wasTopmost, topmost } = unregisterModal(entry)
      if (wasTopmost && !restoreFocus(entry.previousFocus) && topmost?.dialog) focusDialog(topmost.dialog)
      entry.dialog = null
    }
  }, [mounted, open])

  if (!mounted || !(open || rendered) || !globalThis.document?.body) return null

  const requestClose = () => {
    if (canClose && open) onClose()
  }

  return createPortal(
    <div
      data-gcu-modal-layer="drawer"
      data-state={open ? 'open' : 'closing'}
      data-gcu-theme={themeMode}
      className={cx('gcu-drawer-root', themeMode && 'gcu-theme')}
    >
      {closeOnBackdrop && canClose ? (
        <button
          type="button"
          className="gcu-drawer__overlay"
          aria-label="Cerrar panel"
          tabIndex={-1}
          onClick={requestClose}
        />
      ) : (
        <div className="gcu-drawer__overlay" aria-hidden="true" />
      )}
      <dialog
        {...rest}
        ref={setDialogRef}
        open
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : hasTitle ? titleId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        tabIndex={-1}
        className={cx('gcu-drawer', `gcu-drawer--${resolvedSize}`, `gcu-drawer--${side === 'start' ? 'start' : 'end'}`, className)}
      >
        <header className="gcu-drawer__header">
          <div className="gcu-drawer__heading">
            {hasTitle && <h2 id={titleId} className="gcu-drawer__title">{title}</h2>}
            {hasDescription && <p id={descriptionId} className="gcu-drawer__description">{description}</p>}
          </div>
          {canClose && <button type="button" className="btn-close gcu-drawer__close" aria-label="Cerrar" onClick={requestClose} />}
        </header>
        <div className="gcu-drawer__body gcu-scroll">{children}</div>
        {hasContent(footer) && <footer className="gcu-drawer__footer">{footer}</footer>}
      </dialog>
    </div>,
    document.body,
  )
})
