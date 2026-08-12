import React from 'react';
import type { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type: _type = 'order' }) => {
  const styles: Record<string, string> = {
    // Order Statuses
    PENDING: 'bg-amber-100/90 text-amber-900 border-amber-300 font-extrabold',
    ACCEPTED: 'bg-indigo-100/90 text-indigo-900 border-indigo-300 font-extrabold',
    PREPARING: 'bg-blue-100/90 text-blue-900 border-blue-300 font-extrabold animate-pulse-subtle',
    READY: 'bg-emerald-100/90 text-emerald-900 border-emerald-400 font-black shadow-xs',
    COMPLETED: 'bg-stone-100 text-stone-700 border-stone-300 font-bold',
    CANCELLED: 'bg-rose-100/90 text-rose-900 border-rose-300 font-bold',

    // Payment Statuses
    PAID: 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-extrabold',
    FAILED: 'bg-rose-100/90 text-rose-900 border-rose-300 font-bold',
    REFUNDED: 'bg-amber-100/90 text-amber-900 border-amber-300 font-extrabold',
  };

  const badgeStyle = styles[status] || 'bg-stone-100 text-stone-700 border-stone-300';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};
