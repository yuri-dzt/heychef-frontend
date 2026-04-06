import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        }
        <div className="relative">
          {leftIcon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          }
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border bg-white px-3 py-2 text-text-primary 
              placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
              transition-colors duration-200 disabled:bg-gray-50 disabled:text-text-muted
              ${error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border'}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props} />
          
          {rightIcon &&
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted">
              {rightIcon}
            </div>
          }
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>);

  }
);
Input.displayName = 'Input';