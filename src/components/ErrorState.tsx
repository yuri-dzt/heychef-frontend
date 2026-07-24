import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Consistent error state for failed data loads (react-query `isError`).
 * Shows a clear message and a retry action instead of a silent empty screen.
 */
export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Verifique sua conexão e tente novamente.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-danger mb-4">
        <AlertTriangleIcon className="w-8 h-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RefreshCwIcon className="w-4 h-4" />}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
