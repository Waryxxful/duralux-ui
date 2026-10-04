import React, { forwardRef, useEffect, useId } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { SemanticVariant } from '../../tokens';
import { isFunction } from '../../utils/typeGuards';
import { log } from '../../utils/log';
import { cx } from '../../utils/cx';

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: React.ReactNode;
  /** Verbo + objeto («Eliminar campaña»). En `danger` es obligatorio en la práctica: nombra el objeto. */
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Extract<SemanticVariant, 'danger' | 'primary' | 'warning'>;
  loading?: boolean;
  className?: string;
}

const DEFAULT_CONFIRM_LABEL = 'Confirmar';

/**
 * ConfirmDialog — confirmación de una acción con efecto sobre Modal (patrón APG).
 *
 * - Mientras `loading`, ninguna vía cierra el diálogo y el botón muestra spinner.
 * - En `variant="danger"` el título, el mensaje y el botón deben nombrar el objeto
 *   («Eliminar campaña»); con la etiqueta genérica se avisa por `log.warn`.
 * - Los botones se apilan (primario arriba) en contenedores angostos (container query).
 */
export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Confirmar acción',
  message,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = 'Cancelar',
  variant = 'primary',
  loading,
  className,
}, ref) {
  const messageId = useId();
  const isLoading = Boolean(loading);
  const canConfirm = isFunction(onConfirm);
  const canCancel = isFunction(onCancel);
  const genericDestructive = open && variant === 'danger' && confirmLabel === DEFAULT_CONFIRM_LABEL;

  useEffect(() => {
    if (genericDestructive) {
      log.warn('ConfirmDialog destructivo con la etiqueta genérica «Confirmar»: usa `confirmLabel` que nombra el objeto («Eliminar campaña»).');
    }
  }, [genericDestructive]);

  return (
    <Modal
      ref={ref}
      open={open}
      onClose={!isLoading && canCancel ? onCancel : undefined}
      closeOnEscape={!isLoading && canCancel}
      closeOnBackdrop={!isLoading && canCancel}
      showCloseButton={!isLoading && canCancel}
      title={title}
      aria-describedby={messageId}
      size="sm"
      className={cx('gcu-confirm-dialog', variant === 'danger' && 'gcu-confirm-dialog--danger', className)}
      footer={
        <>
          {canCancel && (
            <Button variant="light-brand" onClick={onCancel} disabled={isLoading}>
              {cancelLabel}
            </Button>
          )}
          {canConfirm && (
            <Button variant={variant} onClick={onConfirm} loading={isLoading}>
              {confirmLabel}
            </Button>
          )}
        </>
      }
    >
      <p id={messageId} className="gcu-confirm-dialog__message">{message}</p>
    </Modal>
  );
});
