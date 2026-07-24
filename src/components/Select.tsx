import React, { forwardRef, useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string | number;
    label: string;
  }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', required, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    return (
      <div className="w-full">
        {label &&
        <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
            {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        }
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`
              block w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-text-primary
              focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
              transition-colors duration-200 disabled:bg-gray-50 disabled:text-text-muted
              ${error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border'}
              ${className}
            `}
            {...props}>

            {options.map((option) =>
            <option key={option.value} value={option.value}>
                {option.label}
              </option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>
        {error && <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>);

  }
);
Select.displayName = 'Select';