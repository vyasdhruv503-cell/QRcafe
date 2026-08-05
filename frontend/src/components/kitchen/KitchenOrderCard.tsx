import React from 'react';
import type { OrderRecord } from '../../types';
import { Clock, CheckCircle2, Play, Flame, CheckCheck } from 'lucide-react';
import { Button } from '../common/Button';

interface KitchenOrderCardProps {
  order: OrderRecord;
  onAdvanceStatus: (orderId: string, nextStatus: string) => void;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onAdvanceStatus }) => {
  const isUrgent = (order.elapsedMinutes || 0) > 15;

  const nextStatusConfig: Record<string, { label: string; next: string; icon: any; variant: any }> = {
    PENDING: { label: 'Accept Order', next: 'ACCEPTED', icon: CheckCircle2, variant: 'primary' },
    ACCEPTED: { label: 'Start Preparing', next: 'PREPARING', icon: Flame, variant: 'secondary' },
    PREPARING: { label: 'Mark Ready', next: 'READY', icon: Play, variant: 'primary' },
    READY: { label: 'Complete Order', next: 'COMPLETED', icon: CheckCheck, variant: 'ghost' },
  };

  const config = nextStatusConfig[order.orderStatus];

  return (
    <div
      className={`bg-white rounded-2xl p-4 border shadow-sm flex flex-col justify-between transition-all ${
        isUrgent ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-stone-200'
      }`}
    >
      <div>
        {/* Card Header: Order Number & Table Badge */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
          <div>
            <span className="text-xs font-bold text-stone-400">Order #{order.orderNumber}</span>
            <h3 className="text-lg font-black text-stone-900 leading-tight">{order.tableNumber}</h3>
          </div>

          <div
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
              isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-stone-100 text-stone-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {order.elapsedMinutes || 0}m ago
          </div>
        </div>

        {/* Customer Info / Notes */}
        {order.customerName && order.customerName !== 'Guest Customer' && (
          <p className="text-xs font-semibold text-stone-700 mb-2">Guest: {order.customerName}</p>
        )}

        {order.notes && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-medium">
            <strong>Note:</strong> {order.notes}
          </div>
        )}

        {/* Itemized Order List */}
        <div className="space-y-2 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-stone-900 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0">
                  {item.quantity}x
                </span>
                <div>
                  <span className="font-bold text-stone-800">{item.productName}</span>
                  {item.specialNote && (
                    <p className="text-[11px] text-amber-700 font-medium">↳ {item.specialNote}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Status Transition Button */}
      {config && (
        <div className="pt-3 border-t border-stone-100">
          <Button
            variant={config.variant}
            size="sm"
            className="w-full py-2 text-xs flex items-center justify-center gap-1.5"
            onClick={() => onAdvanceStatus(order.id, config.next)}
          >
            <config.icon className="w-4 h-4" />
            {config.label}
          </Button>
        </div>
      )}
    </div>
  );
};
