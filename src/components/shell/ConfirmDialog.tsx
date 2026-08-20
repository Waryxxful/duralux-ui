import React, { useId } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { SemanticVariant } from '../../tokens';
import { isFunction } from '../../utils/typeGuards';

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Extract<SemanticVariant, 'danger' | 'primary' | 'warning'>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Confirmar acción',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  loading,
}: ConfirmDialogProps) {
  const messageId = useId();
  const isLoading = Boolean(loading);
  const canConfirm = isFunction(onConfirm);
  const canCancel = isFunction(onCancel);

  return (
    <Modal
      open={open}
      onClose={!isLoading && canCancel ? onCancel : undefined}
      closeOnEscape={!isLoading && canCancel}
      closeOnBackdrop={!isLoading && canCancel}
      showCloseButton={!isLoading && canCancel}
      title={title}
      aria-describedby={messageId}
      size="sm"
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
}
