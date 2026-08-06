import React from 'react';
import type { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type: _type = 'order' }) => {
  const styles: Record<string, string> = {
    // Order Statuses
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    ACCEPTED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    PREPARING: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse-subtle',
    READY: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
    COMPLETED: 'bg-stone-100 text-stone-700 border-stone-200',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',

    // Payment Statuses
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    FAILED: 'bg-rose-100 text-rose-800 border-rose-200',
    REFUNDED: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const badgeStyle = styles[status] || 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
