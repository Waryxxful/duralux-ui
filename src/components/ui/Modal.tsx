import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { registerDismissableLayer } from '../../utils/dismissableLayer'
import { useThemeBoundaryMode } from '../../theme/themeBoundary'
import { isFunction, isString } from '../../utils/typeGuards'
import { log } from '../../utils/log'
import { assignRef } from '../../utils/assignRef'
import type { ModalProps } from '../../public/types'
import {
  focusDialog,
  getFocusableElements,
  isTopmostModal,
  registerModal,
  restoreFocus,
  syncModalBackground,
  unregisterModal,
} from './internal/modalStack'

/**
 * Modal — portal-based modal con header/body/footer Duralux (patrón APG «Dialog (Modal)»).
 *
 * Decisión DX-019: se conserva el patrón APG propio en vez de `<dialog>` nativo. jsdom no
 * implementa `showModal()` (no se podría verificar foco atrapado/retorno/Esc/scroll en tests) y
 * la pila global compartida entre bundles (Escape solo en el modal superior, traspaso de foco al
 * modal restante, fondo inert por capa) difiere de la semántica del top layer nativo.
 * Entra con `gcu-enter`; no anima la salida porque el cierre es síncrono (foco y scroll se
 * restauran en el mismo tick, contrato que verifican Modal.test y AppLayout.test).
 *
 * Props:
 *   open     — boolean
 *   onClose  — called when backdrop or X is clicked
 *   closeOnEscape   — permite cerrar con Escape (default true)
 *   closeOnBackdrop — permite cerrar al hacer click fuera del contenido (default true)
 *   showCloseButton  — muestra el botón X del header (default true)
 *   title    — modal title
 *   size       — "sm" | "lg" | "xl" | "fullscreen" | undefined (default medium)
 *   scrollable — cuerpo con scroll interno (modal-dialog-scrollable)
 *   footer     — JSX for footer (usually buttons)
 */
export const Modal = /* @__PURE__ */ forwardRef<HTMLDivElement, ModalProps>(function Modal({
  open = false,
  onClose,
  closeOnEscape = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  title,
  size = undefined,
  scrollable = false,
  footer = null,
  children,
  className = '',
  style: dialogStyle = undefined,
  id = undefined,
  role = undefined,
  'aria-label': ariaLabel = undefined,
  'aria-labelledby': ariaLabelledBy = undefined,
  'aria-describedby': ariaDescribedBy = undefined,
  onClick: onDialogClick = undefined,
  ...rest
}, forwardedRef) {
  const titleId = useId()
  const themeMode = useThemeBoundaryMode()
  const hasTitle = isString(title)
    ? title.trim() !== ''
    : title !== undefined && title !== null && title !== false
  const canClose = isFunction(onClose)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const backdropRef = useRef(null)
  const setDialogRef = useCallback((node: HTMLDivElement | null) => {
    dialogRef.current = node
    assignRef(forwardedRef, node)
  }, [forwardedRef])
  const modalEntryRef = useRef({ dialog: null, backdrop: null, previousFocus: null })
  const closeOnEscapeRef = useRef(closeOnEscape)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    if (globalThis.document) setMounted(true)
  }, [])

  useEffect(() => {
    closeOnEscapeRef.current = closeOnEscape
    onCloseRef.current = onClose
  }, [closeOnEscape, onClose])

  useEffect(() => {
    if (!open || !mounted || !globalThis.document?.body) return

    const entry = modalEntryRef.current
    entry.dialog = dialogRef.current
    entry.backdrop = backdropRef.current
    entry.previousFocus = document.activeElement
    registerModal(entry)
    const unregisterLayer = registerDismissableLayer({
      element: entry.dialog,
      onEscape: () => {
        if (!closeOnEscapeRef.current) return
        if (isFunction(onCloseRef.current)) onCloseRef.current()
      },
    })
    const backgroundObserver = isFunction(globalThis.MutationObserver)
      ? new MutationObserver(() => syncModalBackground())
      : null
    backgroundObserver?.observe(document.body, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-hidden', 'inert'],
    })
    const focusableElements = getFocusableElements(entry.dialog)
    const onlyFocusableControlIsCloseButton = !hasTitle
      && focusableElements.length === 1
      && focusableElements[0].classList.contains('btn-close')
    if (onlyFocusableControlIsCloseButton) entry.dialog.focus()
    else focusDialog(entry.dialog)

    return () => {
      backgroundObserver?.disconnect()
      unregisterLayer()
      const { wasTopmost, topmost } = unregisterModal(entry)
      if (wasTopmost) {
        if (!restoreFocus(entry.previousFocus) && topmost?.dialog) {
          focusDialog(topmost.dialog)
        }
      }
      entry.dialog = null
      entry.backdrop = null
    }
  }, [hasTitle, open, mounted])

  useEffect(() => {
    if (!open || !mounted || !globalThis.document?.body) return

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      const entry = modalEntryRef.current
      if (!isTopmostModal(entry)) return

      const dialog = entry.dialog
      const focusableElements = getFocusableElements(dialog)
      if (focusableElements.length === 0) {
        e.preventDefault()
        dialog.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement
      const focusIsInSequence = focusableElements.some((element) => element === activeElement)
      if (e.shiftKey && (activeElement === first || !focusIsInSequence)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (activeElement === last || !focusIsInSequence)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, mounted])

  if (!open || !mounted || !globalThis.document?.body) return null

  const effectiveLabelledBy = ariaLabelledBy
    ?? (hasTitle && ariaLabel === undefined ? titleId : undefined)
  const fallbackLabel = ariaLabel === undefined && effectiveLabelledBy === undefined && !hasTitle
    ? 'Modal'
    : undefined
  if (fallbackLabel) log.warn('Modal sin nombre accesible: pasa `title`, `aria-label` o `aria-labelledby`.')
  const handleBackdropClick = (event) => {
    if (
      event.target === event.currentTarget
      && closeOnBackdrop
      && canClose
      && isTopmostModal(modalEntryRef.current)
    ) {
      onClose()
    }
  }
  const handleDialogClick = (event) => {
    onDialogClick?.(event)
    if (!event.defaultPrevented) handleBackdropClick(event)
  }

  const modalMarkup = (
    <>
      <div
        {...rest}
        id={id}
        data-gcu-modal-layer="dialog"
        className={['modal fade show', themeMode && 'gcu-theme', className].filter(Boolean).join(' ')}
        data-gcu-theme={themeMode}
        style={{ ...(dialogStyle || {}), display: 'block' }}
        tabIndex={-1}
        role={role ?? 'dialog'}
        aria-modal="true"
        aria-labelledby={effectiveLabelledBy}
        aria-label={ariaLabel !== undefined ? ariaLabel : fallbackLabel}
        aria-describedby={ariaDescribedBy}
        ref={setDialogRef}
        onClick={handleDialogClick}
      >
        <div className={`modal-dialog gcu-modal-dialog${size ? ` modal-${size}` : ''} modal-dialog-centered${scrollable ? ' modal-dialog-scrollable' : ''}`}>
          <div className="modal-content">
            {(hasTitle || (showCloseButton && canClose)) && (
              <div className="modal-header">
                {hasTitle && <h5 className="modal-title" id={titleId}>{title}</h5>}
                {showCloseButton && canClose && (
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => onClose()}></button>
                )}
              </div>
            )}
            <div className="modal-body gcu-modal-body">
              {children}
            </div>
            {footer !== undefined && footer !== null && footer !== false && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
      {closeOnBackdrop && canClose ? (
        <button
          type="button"
          data-gcu-modal-layer="backdrop"
          className="modal-backdrop fade show"
          ref={backdropRef}
          aria-label="Cerrar modal"
          tabIndex={-1}
          style={{ border: 0, padding: 0 }}
          onClick={handleBackdropClick}
        />
      ) : (
        <div
          data-gcu-modal-layer="backdrop"
          className="modal-backdrop fade show"
          ref={backdropRef}
          aria-hidden="true"
        />
      )}
    </>
  )

  const portalTarget = globalThis.document?.body ?? null
  return portalTarget ? createPortal(modalMarkup, portalTarget) : null
})
