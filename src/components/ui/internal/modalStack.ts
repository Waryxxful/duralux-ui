/**
 * Pila de capas modales compartida (Modal, Drawer): bloqueo del scroll del body, fondo
 * `inert` por capa, foco inicial, trampa de Tab y retorno de foco. El estado vive en
 * `globalThis` con `Symbol.for` para que dos copias del paquete compartan la misma pila.
 * Las capas se marcan con `data-gcu-modal-layer`; el resto de los hijos del body queda inert.
 */
import { isFunction } from '../../../utils/typeGuards'
export const FOCUSABLE_SELECTOR = [
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
export function syncModalBackground() {
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

export function getFocusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => (
    element.tabIndex >= 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]')
  ))
}

export function focusDialog(dialog, last = false) {
  const focusableElements = getFocusableElements(dialog)
  const target = (last ? focusableElements[focusableElements.length - 1] : focusableElements[0]) || dialog
  try {
    target.focus()
  } catch {
    // Fall through to the dialog when a consumer-controlled focus target fails.
  }
  if (target !== dialog && dialog.ownerDocument.activeElement !== target) dialog.focus()
}

export function restoreFocus(element) {
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

export function registerModal(entry) {
  if (modalState.modalStack.length === 0) lockBody()
  if (!modalState.modalStack.includes(entry)) modalState.modalStack.push(entry)
  syncModalBackground()
}

export function unregisterModal(entry) {
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

export function isTopmostModal(entry) {
  const { modalStack } = modalState
  return modalStack[modalStack.length - 1] === entry
}
