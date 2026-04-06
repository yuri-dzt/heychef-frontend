import React from 'react';
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | 'full';
}
export function PageContainer({
  children,
  className = '',
  maxWidth = 'xl'
}: PageContainerProps) {
  const maxWidthClasses = {
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };
  return (
    <div
      className={`w-full mx-auto p-4 md:p-6 lg:p-8 ${maxWidthClasses[maxWidth]} ${className}`}>
      
      {children}
    </div>);

}