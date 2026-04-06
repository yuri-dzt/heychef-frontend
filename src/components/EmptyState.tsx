import React from 'react';
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-text-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      {description &&
      <p className="text-sm text-text-secondary max-w-sm mb-6">
          {description}
        </p>
      }
      {action && <div>{action}</div>}
    </div>);

}