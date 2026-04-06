import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
      <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
          variant={isDanger ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}>
          
            {confirmText}
          </Button>
        </>
      }>
      
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-full flex-shrink-0 ${isDanger ? 'bg-red-100 text-danger' : 'bg-yellow-100 text-warning'}`}>
          
          <AlertTriangleIcon className="w-6 h-6" />
        </div>
        <p className="text-text-secondary mt-1">{message}</p>
      </div>
    </Modal>);

}