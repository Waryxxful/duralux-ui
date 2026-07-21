import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { SemanticVariant } from '../../tokens';

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
  return (
    <Modal
      open={open}
      onClose={onCancel}
      closeOnEscape={!loading}
      closeOnBackdrop={!loading}
      showCloseButton={!loading}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="light-brand" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="gcu-confirm-dialog__message">{message}</p>
    </Modal>
  );
}
