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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#140D0B] w-full max-w-lg rounded-3xl shadow-2xl border border-[#38241D] overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-5 bg-[#170E0B] text-white flex items-center justify-between border-b border-[#38241D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#281A15] border border-[#483027] flex items-center justify-center text-[#00F5D4] font-bold box-glow-green">
              <History className="w-5 h-5 text-[#00F5D4]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">My Order History</h2>
              <p className="text-xs text-[#00F5D4] font-medium">
                {orders.length} {orders.length === 1 ? 'order placed' : 'orders placed'} from this device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-[#2A1D18] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#140D0B]">
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-[#1F1512] rounded-3xl border border-[#38241D] p-6 space-y-3">
              <div className="w-12 h-12 bg-[#281A15] text-[#00F5D4] rounded-full flex items-center justify-center mx-auto box-glow-green border border-[#483027]">
                <ShoppingBag className="w-6 h-6 text-[#00F5D4]" />
              </div>
              <h3 className="text-sm font-black text-white">No previous orders found</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
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
                className="bg-[#1F1512] rounded-2xl p-4 border border-[#38241D] shadow-md hover:border-[#00F5D4]/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#33221B]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      Order #{ord.orderNumber}
                    </span>
                    <span className="text-[11px] font-semibold bg-[#2B1C17] text-[#00F5D4] border border-[#482F26] px-2 py-0.5 rounded-lg">
                      {ord.tableNumber}
                    </span>
                  </div>
                  <StatusBadge status={ord.orderStatus} />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-300">
                      {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'} • ₹
                      {Number(ord.total).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {new Date(ord.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-[#00F5D4] group-hover:translate-x-1 transition-transform">
                    <span>Track Order</span>
                    <ChevronRight className="w-4 h-4 ml-0.5 stroke-[3]" />
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
