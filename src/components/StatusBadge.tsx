import React from 'react';
import { Badge } from './Badge';
import { getStatusLabel } from '../utils/format';
import type { OrderStatus } from '../types';
interface StatusBadgeProps {
  status: OrderStatus | 'OPEN' | 'RESOLVED';
  className?: string;
}
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'RECEIVED':
      case 'OPEN':
        return 'info';
      case 'PREPARING':
        return 'warning';
      case 'READY':
        return 'primary';
      case 'DELIVERED':
      case 'RESOLVED':
        return 'success';
      case 'CANCELED':
        return 'danger';
      default:
        return 'default';
    }
  };
  return (
    <Badge variant={getVariant()} className={className}>
      {getStatusLabel(status)}
    </Badge>);

}