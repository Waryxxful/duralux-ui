import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { registerDismissableLayer } from '../../utils/dismissableLayer'
import { useThemeBoundaryMode } from '../../theme/themeBoundary'
import { isFunction, isString } from '../../utils/typeGuards'
import { log } from '../../utils/log'
import type { ModalProps } from '../../public/types'

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
  const existingState = globalThis[MODAL_STATE_KEY]
  if (existingState) {
    if (!existingState.backgroundState) {
      Object.defineProperty(existingState, 'backgroundState', {
        value: { records: new Map() },
        enumerable: false,
        writable: true,
      })
    }
    return existingState
  }

  const state = { modalStack: [], bodyLockState: null }
  Object.defineProperty(state, 'backgroundState', {
    value: { records: new Map() },
    enumerable: false,
    writable: true,
  })
  globalThis[MODAL_STATE_KEY] = state
  return state
}

const modalState = getModalState()

function isModalLayer(element) {
  return Boolean(
    element?.matches?.('[data-gcu-modal-layer], .modal, .modal-backdrop'),
  )
}

function readInertProperty(element) {
  try {
    return 'inert' in element ? element.inert : undefined
  } catch {
    return undefined
  }
}

function captureBackgroundRecord(element) {
  const existing = modalState.backgroundState.records.get(element)
  if (existing) return existing

  const record = {
    element,
    hadInertProperty: 'inert' in element,
    previousInert: readInertProperty(element),
    previousInertAttribute: element.getAttribute('inert'),
    previousAriaHidden: element.getAttribute('aria-hidden'),
    appliedInert: true,
    appliedInertAttribute: '',
    appliedAriaHidden: 'true',
    externalInert: null,
    externalAriaHidden: null,
    owners: new Set(),
  }
  modalState.backgroundState.records.set(element, record)
  return record
}

function setBackgroundInert(element) {
  if (readInertProperty(element) !== true) {
    try {
      element.inert = true
    } catch {
      // The attribute fallback still makes the contract work in older DOMs.
    }
  }
  if (element.getAttribute('inert') !== '') element.setAttribute('inert', '')
  if (element.getAttribute('aria-hidden') !== 'true') element.setAttribute('aria-hidden', 'true')
}

function restoreBackgroundRecord(record) {
  const { element } = record
  if (!element) return

  const currentInert = readInertProperty(element)
  const currentInertAttribute = element.getAttribute('inert')
  const currentAriaHidden = element.getAttribute('aria-hidden')
  const managerStillOwnsInert = (
    currentInert === record.appliedInert
    && currentInertAttribute === record.appliedInertAttribute
  )
  const managerStillOwnsAriaHidden = currentAriaHidden === record.appliedAriaHidden

  if (managerStillOwnsInert) {
    const inertAttribute = record.externalInert
      ? record.externalInert.attribute
      : record.previousInertAttribute
    const inertProperty = record.externalInert ? record.externalInert.property : record.previousInert
    if (inertAttribute === null) element.removeAttribute('inert')
    else element.setAttribute('inert', inertAttribute)

    if (record.hadInertProperty) {
      try {
        element.inert = inertProperty
      } catch {
        // Keep the restored inert attribute when the property is read-only.
      }
    } else {
      try {
        delete element.inert
      } catch {
        // The attribute restoration above is the safe fallback.
      }
    }

  }
  if (managerStillOwnsAriaHidden) {
    const ariaHidden = record.externalAriaHidden
      ? record.externalAriaHidden.value
      : record.previousAriaHidden
    if (ariaHidden === null) element.removeAttribute('aria-hidden')
    else element.setAttribute('aria-hidden', ariaHidden)
  }
}

function rememberExternalBackgroundValues(record) {
  const { element } = record
  const currentInert = readInertProperty(element)
  const currentInertAttribute = element.getAttribute('inert')
  const currentAriaHidden = element.getAttribute('aria-hidden')
  if (
    currentInert !== record.appliedInert
    || currentInertAttribute !== record.appliedInertAttribute
  ) {
    record.externalInert = { property: currentInert, attribute: currentInertAttribute }
  }
  if (currentAriaHidden !== record.appliedAriaHidden) {
    record.externalAriaHidden = { value: currentAriaHidden }
  }
}

/**
 * Keep background ownership per modal entry. Direct body children are the
 * smallest safe boundary here: the modal and backdrop are marked layers and
 * remain interactive, while app roots and unrelated portal hosts become
 * inert. Each record restores only values still owned by this manager.
 */
function syncModalBackground() {
  if (!globalThis.document?.body) return

  const activeEntries = new Set(modalState.modalStack)
  const bodyChildren = Array.from(document.body.children)
  const records = modalState.backgroundState.records

  records.forEach((record, element) => {
    if (!element.isConnected || element.parentElement !== document.body) {
      record.owners.forEach((owner) => {
        if (!activeEntries.has(owner)) record.owners.delete(owner)
      })
      if (activeEntries.size === 0) {
        rememberExternalBackgroundValues(record)
        restoreBackgroundRecord(record)
        records.delete(element)
      }
      return
    }
    record.owners.forEach((owner) => {
      if (!activeEntries.has(owner)) record.owners.delete(owner)
    })
  })

  bodyChildren.forEach((element) => {
    if (isModalLayer(element)) {
      const record = records.get(element)
      if (record) {
        record.owners.clear()
        rememberExternalBackgroundValues(record)
        restoreBackgroundRecord(record)
        records.delete(element)
      }
      return
    }

    if (activeEntries.size === 0) return
    const record = captureBackgroundRecord(element)
    activeEntries.forEach((entry) => record.owners.add(entry))
    rememberExternalBackgroundValues(record)
    setBackgroundInert(element)
  })

  if (activeEntries.size === 0) {
    records.forEach((record, element) => {
      record.owners.clear()
      rememberExternalBackgroundValues(record)
      restoreBackgroundRecord(record)
      records.delete(element)
    })
  }
}

function getFocusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => (
    element.tabIndex >= 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]')
  ))
}

function focusDialog(dialog, last = false) {
  const focusableElements = getFocusableElements(dialog)
  const target = (last ? focusableElements[focusableElements.length - 1] : focusableElements[0]) || dialog
  try {
    target.focus()
  } catch {
    // Fall through to the dialog when a consumer-controlled focus target fails.
  }
  if (target !== dialog && dialog.ownerDocument.activeElement !== target) dialog.focus()
}

function restoreFocus(element) {
  if (
    !element?.isConnected
    || !isFunction(element.focus)
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
  if (!modalState.modalStack.includes(entry)) modalState.modalStack.push(entry)
  syncModalBackground()
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
  syncModalBackground()
  return { wasTopmost, topmost: modalStack[modalStack.length - 1] }
}

function isTopmostModal(entry) {
  const { modalStack } = modalState
  return modalStack[modalStack.length - 1] === entry
}

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
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal({
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
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
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
      const focusIsInSequence = focusableElements.includes(activeElement as HTMLElement)
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
