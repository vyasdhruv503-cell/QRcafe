import React from 'react';
import type { OrderRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { History, X, ChevronRight, Clock, ShoppingBag } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onSelectOrder: (orderToken: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-bold shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">My Order History</h2>
              <p className="text-xs text-amber-400 font-medium">
                {orders.length} {orders.length === 1 ? 'order placed' : 'orders placed'} from this device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#fdfbf7]">
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-stone-800">No previous orders found</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                When you place orders, your receipt history and live track status will appear here.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.orderToken || ord.id}
                onClick={() => {
                  onSelectOrder(ord.orderToken);
                  onClose();
                }}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group hover:border-amber-400"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-stone-900">
                      Order #{ord.orderNumber}
                    </span>
                    <span className="text-[11px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg">
                      {ord.tableNumber}
                    </span>
                  </div>
                  <StatusBadge status={ord.orderStatus} />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-600">
                      {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'} • ₹
                      {Number(ord.total).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ord.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                    <span>Track Order</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
