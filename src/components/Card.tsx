import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  noPadding?: boolean;
}
export function Card({
  children,
  hoverable = false,
  noPadding = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-surface border border-border rounded-xl shadow-sm
        ${hoverable ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300' : ''}
        ${!noPadding ? 'p-6' : ''}
        ${className}
      `}
      {...props}>
      
      {children}
    </div>);

}