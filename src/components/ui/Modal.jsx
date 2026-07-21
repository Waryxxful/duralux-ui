import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { registerDismissableLayer } from '../../utils/dismissableLayer'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const MODAL_STATE_KEY = Symbol.for('@duralux/ui/modal-state')

function getModalState() {
  if (globalThis[MODAL_STATE_KEY]) return globalThis[MODAL_STATE_KEY]

  const state = { modalStack: [], bodyLockState: null }
  globalThis[MODAL_STATE_KEY] = state
  return state
}

const modalState = getModalState()

function getFocusableElements(dialog) {
  return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => (
    element.tabIndex >= 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]')
  ))
}

function focusDialog(dialog, last = false) {
  const focusableElements = getFocusableElements(dialog)
  const target = (last ? focusableElements[focusableElements.length - 1] : focusableElements[0]) || dialog
  target.focus()
}

function restoreFocus(element) {
  if (
    !element?.isConnected
    || typeof element.focus !== 'function'
    || element.matches?.(':disabled')
    || element.closest?.('[hidden], [inert], [aria-hidden="true"]')
  ) {
    return false
  }

  const view = element.ownerDocument?.defaultView
  const style = view?.getComputedStyle(element)
  if (style?.display === 'none' || style?.visibility === 'hidden') return false

  try {
    element.focus()
  } catch {
    return false
  }
  return element.ownerDocument.activeElement === element
}

function lockBody() {
  const { body } = document
  modalState.bodyLockState = {
    body,
    hadModalOpenClass: body.classList.contains('modal-open'),
    overflow: body.style.getPropertyValue('overflow'),
    overflowPriority: body.style.getPropertyPriority('overflow'),
    lockedOverflow: 'hidden',
    lockedOverflowPriority: '',
  }
  body.classList.add('modal-open')
  body.style.setProperty('overflow', modalState.bodyLockState.lockedOverflow)
}

function unlockBody() {
  if (!modalState.bodyLockState) return

  const {
    body,
    hadModalOpenClass,
    overflow,
    overflowPriority,
    lockedOverflow,
    lockedOverflowPriority,
  } = modalState.bodyLockState
  body.classList.toggle('modal-open', hadModalOpenClass)
  if (
    body.style.getPropertyValue('overflow') === lockedOverflow
    && body.style.getPropertyPriority('overflow') === lockedOverflowPriority
  ) {
    if (overflow) {
      body.style.setProperty('overflow', overflow, overflowPriority)
    } else {
      body.style.removeProperty('overflow')
    }
  }
  modalState.bodyLockState = null
}

function registerModal(entry) {
  if (modalState.modalStack.length === 0) lockBody()
  modalState.modalStack.push(entry)
}

function unregisterModal(entry) {
  const { modalStack } = modalState
  const index = modalStack.indexOf(entry)
  if (index === -1) return { wasTopmost: false, topmost: modalStack[modalStack.length - 1] }

  const wasTopmost = index === modalStack.length - 1
  modalStack.splice(index, 1)

  const modalAbove = modalStack[index]
  if (modalAbove && entry.dialog?.contains(modalAbove.previousFocus)) {
    modalAbove.previousFocus = entry.previousFocus
  }

  if (modalStack.length === 0) unlockBody()
  return { wasTopmost, topmost: modalStack[modalStack.length - 1] }
}

function isTopmostModal(entry) {
  const { modalStack } = modalState
  return modalStack[modalStack.length - 1] === entry
}

/**
 * Modal — portal-based modal con header/body/footer Duralux.
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
export function Modal({
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
}) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const modalEntryRef = useRef({ dialog: null, previousFocus: null })
  const closeOnEscapeRef = useRef(closeOnEscape)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    closeOnEscapeRef.current = closeOnEscape
    onCloseRef.current = onClose
  }, [closeOnEscape, onClose])

  useEffect(() => {
    if (!open) return

    const entry = modalEntryRef.current
    entry.dialog = dialogRef.current
    entry.previousFocus = document.activeElement
    registerModal(entry)
    const unregisterLayer = registerDismissableLayer({
      element: entry.dialog,
      onEscape: () => {
        if (!closeOnEscapeRef.current) return
        onCloseRef.current?.()
      },
    })
    focusDialog(entry.dialog)

    return () => {
      unregisterLayer()
      const { wasTopmost, topmost } = unregisterModal(entry)
      if (wasTopmost) {
        if (!restoreFocus(entry.previousFocus) && topmost?.dialog) {
          focusDialog(topmost.dialog)
        }
      }
      entry.dialog = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return

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
      const focusIsInSequence = focusableElements.includes(activeElement)
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
  }, [open])

  if (!open) return null

  return createPortal(
    <>
      <div
        className="modal fade show"
        style={{ display: 'block' }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        ref={dialogRef}
        onClick={(e) => {
          if (
            e.target === e.currentTarget
            && closeOnBackdrop
            && isTopmostModal(modalEntryRef.current)
          ) {
            onClose?.()
          }
        }}
      >
        <div className={`modal-dialog${size ? ` modal-${size}` : ''} modal-dialog-centered${scrollable ? ' modal-dialog-scrollable' : ''}`}>
          <div className="modal-content">
            {title && (
              <div className="modal-header">
                <h5 className="modal-title" id={titleId}>{title}</h5>
                {showCloseButton && (
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
                )}
              </div>
            )}
            <div className="modal-body">
              {children}
            </div>
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>,
    document.body,
  )
}
