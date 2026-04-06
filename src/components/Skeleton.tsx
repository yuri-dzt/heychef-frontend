import React from 'react';
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}
export function Skeleton({
  className = '',
  width,
  height,
  circle = false
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: circle ? '50%' : undefined
  };
  return (
    <div
      className={`skeleton ${circle ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={style} />);


}