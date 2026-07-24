import React from 'react';
import { Loader2Icon } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary',
    secondary:
    'bg-white border border-border text-text-primary hover:bg-gray-50 focus-visible:ring-gray-200',
    ghost:
    'bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary focus-visible:ring-gray-200',
    danger: 'bg-danger hover:bg-danger-hover text-white focus-visible:ring-danger'
  };
  // md/lg meet the 44px minimum touch target; sm stays compact for dense rows.
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];
  return (
    <button
      type={props.type ?? 'button'}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}>

      {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>);

}