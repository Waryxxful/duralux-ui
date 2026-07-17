import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Modal — portal-based modal con header/body/footer Duralux.
 *
 * Props:
 *   open     — boolean
 *   onClose  — called when backdrop or X is clicked
 *   title    — modal title
 *   size       — "sm" | "lg" | "xl" | "fullscreen" | undefined (default medium)
 *   scrollable — cuerpo con scroll interno (modal-dialog-scrollable)
 *   footer     — JSX for footer (usually buttons)
 */
export function Modal({ open = false, onClose, title, size = undefined, scrollable = false, footer = null, children }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Foco: al abrir, foco al contenedor del diálogo; al cerrar, restaurarlo al elemento previo.
  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement
    dialogRef.current?.focus()
    return () => {
      previousFocusRef.current?.focus?.()
    }
  }, [open])

  // Cierre con Escape mientras el modal está abierto.
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

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
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      >
        <div className={`modal-dialog${size ? ` modal-${size}` : ''} modal-dialog-centered${scrollable ? ' modal-dialog-scrollable' : ''}`}>
          <div className="modal-content">
            {title && (
              <div className="modal-header">
                <h5 className="modal-title" id={titleId}>{title}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
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
