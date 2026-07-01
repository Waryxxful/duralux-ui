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
export function Modal({ open, onClose, title, size, scrollable, footer, children }) {
  if (!open) return null

  return createPortal(
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
        <div className={`modal-dialog${size ? ` modal-${size}` : ''} modal-dialog-centered${scrollable ? ' modal-dialog-scrollable' : ''}`}>
          <div className="modal-content">
            {title && (
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
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
