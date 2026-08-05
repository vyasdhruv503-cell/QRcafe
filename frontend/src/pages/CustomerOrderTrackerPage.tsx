import React, { useEffect, useState } from 'react';
import type { OrderRecord } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { CheckCircle2, Utensils, RefreshCw, ArrowLeft } from 'lucide-react';

interface CustomerOrderTrackerPageProps {
  orderToken: string;
  onBackToMenu: () => void;
}

const FALLBACK_ORDER: OrderRecord = {
  id: 'ord_1',
  orderNumber: 105,
  orderToken: 'ord_demo_105',
  tableNumber: 'Table 01',
  customerName: 'Guest Customer',
  orderStatus: 'PREPARING',
  paymentStatus: 'PENDING',
  paymentMethod: 'PAY_AT_COUNTER',
  subtotal: 398.0,
  tax: 19.9,
  discount: 0,
  total: 417.9,
  cafeName: 'My Cafe',
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'item_1',
      productName: 'Margherita Supreme',
      price: 349.0,
      quantity: 1,
      subtotal: 349.0,
    },
    {
      id: 'item_2',
      productName: 'Iced Vanilla Bean Latte',
      price: 149.0,
      quantity: 1,
      subtotal: 149.0,
    },
  ],
} as any;

export const CustomerOrderTrackerPage: React.FC<CustomerOrderTrackerPageProps> = ({
  orderToken,
  onBackToMenu,
}) => {
  const [order, setOrder] = useState<OrderRecord>(FALLBACK_ORDER);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrderStatus = async () => {
    try {
      const data = await api.trackOrder(orderToken);
      if (data && data.orderNumber) {
        setOrder(data);
      }
    } catch (err) {
      console.warn('API order track fallback active:', err);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [orderToken]);

  const steps = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  const currentStepIndex = Math.max(0, steps.indexOf(order.orderStatus));

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 max-w-lg mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-4">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>
        <button
          onClick={fetchOrderStatus}
          className="p-2 text-stone-400 hover:text-amber-600 rounded-xl transition-colors"
          title="Refresh Status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-6">
        {/* Header info */}
        <div className="text-center pb-4 border-b border-stone-100">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-3 shadow-xs">
            <Utensils className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            {order.cafeName || 'My Cafe'}
          </span>
          <h1 className="text-2xl font-black text-stone-900 mt-0.5">Order #{order.orderNumber}</h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">{order.tableNumber}</p>
        </div>

        {/* Live Status Progress Stepper */}
        <div className="py-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Live Status</span>
            <StatusBadge status={order.orderStatus} />
          </div>

          <div className="relative flex items-center justify-between px-2">
            {/* Progress line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-100 -z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-amber-600 transition-all duration-500 -z-0"
              style={{
                width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
              }}
            />

            {steps.map((step, idx) => {
              const isDone = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isDone
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                        : 'bg-white border-2 border-stone-200 text-stone-400'
                    } ${isCurrent ? 'animate-bounce' : ''}`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 mt-2 capitalize">
                    {step.toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Ordered Items</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs font-semibold text-stone-800">
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span>₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-1 text-xs font-medium text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Amount</span>
              <span className="text-amber-700">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
