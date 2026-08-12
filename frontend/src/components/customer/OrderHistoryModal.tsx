import React, { useState } from 'react';
import type { OrderRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  History as HistoryIcon,
  X as XIcon,
  ChevronRight as ChevronRightIcon,
  Clock as ClockIcon,
  ShoppingBag as ShoppingBagIcon,
  RotateCcw as RotateCcwIcon,
  Trash2 as Trash2Icon,
  Receipt as ReceiptIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onSelectOrder: (orderToken: string) => void;
  onReOrder?: (items: { productId?: string; productName: string; price: number; quantity: number }[]) => void;
  onClearHistory?: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onReOrder,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [expandedOrderToken, setExpandedOrderToken] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const isActiveStatus = (status: string) =>
    ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(status.toUpperCase());

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'ACTIVE') return isActiveStatus(ord.orderStatus);
    if (activeTab === 'COMPLETED') return !isActiveStatus(ord.orderStatus);
    return true;
  });

  const activeCount = orders.filter((o) => isActiveStatus(o.orderStatus)).length;
  const completedCount = orders.length - activeCount;

  const toggleExpand = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOrderToken(expandedOrderToken === token ? null : token);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#140D0B] w-full max-w-lg rounded-3xl shadow-2xl border border-[#38241D] overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#170E0B] text-white flex items-center justify-between border-b border-[#38241D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#281A15] border border-[#483027] flex items-center justify-center text-[#00F5D4] font-bold box-glow-green">
              <HistoryIcon className="w-5 h-5 text-[#00F5D4]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                My Order History
                {activeCount > 0 && (
                  <span className="bg-[#00F5D4]/20 text-[#00F5D4] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#00F5D4]/40 animate-pulse">
                    {activeCount} Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed on this device
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {orders.length > 0 && onClearHistory && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Clear order history"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-[#2A1D18] rounded-xl transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex items-center gap-1 p-2 bg-[#1B120F] border-b border-[#2C1E19] px-4">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'ALL'
                  ? 'bg-[#00F5D4] text-[#140D0B] shadow-sm font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#281A15]'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'ACTIVE'
                  ? 'bg-[#00F5D4] text-[#140D0B] shadow-sm font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#281A15]'
              }`}
            >
              <span>Active</span>
              {activeCount > 0 && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'ACTIVE' ? 'bg-[#140D0B]' : 'bg-[#00F5D4] animate-ping'}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeTab === 'COMPLETED'
                  ? 'bg-[#00F5D4] text-[#140D0B] shadow-sm font-black'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#281A15]'
              }`}
            >
              History ({completedCount})
            </button>
          </div>
        )}

        {/* Clear History Confirmation Banner */}
        {showClearConfirm && (
          <div className="p-3.5 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <span>Clear local order history from this browser?</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 bg-[#251814] hover:bg-[#38241D] text-stone-300 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory?.();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-[#140D0B]">
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-[#1F1512] rounded-3xl border border-[#38241D] p-6 space-y-3">
              <div className="w-14 h-14 bg-[#281A15] text-[#00F5D4] rounded-full flex items-center justify-center mx-auto box-glow-green border border-[#483027]">
                <ShoppingBagIcon className="w-7 h-7 text-[#00F5D4]" />
              </div>
              <h3 className="text-base font-black text-white">No previous orders found</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                When you place orders, your digital receipt history and live track status will appear here.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-10 text-center bg-[#1F1512] rounded-3xl border border-[#38241D] p-6">
              <p className="text-xs text-stone-400 font-semibold">
                No orders match the selected "{activeTab.toLowerCase()}" filter tab.
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isExpanded = expandedOrderToken === ord.orderToken;
              const active = isActiveStatus(ord.orderStatus);

              return (
                <div
                  key={ord.orderToken || ord.id}
                  className={`bg-[#1F1512] rounded-2xl border transition-all overflow-hidden ${
                    active ? 'border-[#00F5D4]/40 shadow-lg shadow-[#00F5D4]/5' : 'border-[#38241D] hover:border-[#4E3228]'
                  }`}
                >
                  {/* Card Header Top */}
                  <div
                    onClick={() => {
                      onSelectOrder(ord.orderToken);
                      onClose();
                    }}
                    className="p-4 cursor-pointer hover:bg-[#261B17] transition-colors"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#33221B]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold bg-[#2B1C17] text-[#00F5D4] border border-[#482F26] px-2 py-0.5 rounded-lg">
                          {ord.tableNumber}
                        </span>
                      </div>
                      <StatusBadge status={ord.orderStatus} />
                    </div>

                    {/* Order Highlights */}
                    <div className="pt-3 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-200">
                          {ord.items?.length || 0} {ord.items?.length === 1 ? 'item' : 'items'} • ₹
                          {Number(ord.total).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-stone-400 flex items-center gap-1.5">
                          <ClockIcon className="w-3 h-3 text-amber-400 shrink-0" />
                          {new Date(ord.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleExpand(ord.orderToken, e)}
                          className="p-1.5 bg-[#2B1C17] hover:bg-[#38241D] text-stone-300 rounded-xl border border-[#482F26] text-xs font-semibold flex items-center gap-1 transition-all"
                          title="View Receipt Details"
                        >
                          <ReceiptIcon className="w-3.5 h-3.5 text-stone-400" />
                          {isExpanded ? (
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(ord.orderToken);
                            onClose();
                          }}
                          className="bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 border border-[#00F5D4]/40 text-[#00F5D4] px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 shrink-0"
                        >
                          <span>{active ? 'Track' : 'View'}</span>
                          <ChevronRightIcon className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Receipt Breakdown */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-[#170E0C] border-t border-[#33221B] text-xs space-y-2.5 animate-fadeIn">
                      <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ReceiptIcon className="w-3.5 h-3.5" />
                        <span>Order Summary</span>
                      </div>

                      <div className="space-y-1.5 divide-y divide-[#2B1B16]">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.map((item, idx) => (
                            <div key={idx} className="pt-1.5 flex items-start justify-between gap-2 text-stone-300">
                              <div>
                                <span className="font-bold text-white">
                                  {item.quantity}x {item.productName}
                                </span>
                                {item.specialNote && (
                                  <p className="text-[10px] text-amber-400/90 italic">
                                    Note: {item.specialNote}
                                  </p>
                                )}
                              </div>
                              <span className="font-semibold text-stone-400 shrink-0">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-stone-500 italic">No item snapshot available</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#38241D] flex items-center justify-between text-stone-400 text-[11px]">
                        <span>Subtotal: ₹{Number(ord.subtotal || 0).toFixed(2)} • Tax: ₹{Number(ord.tax || 0).toFixed(2)}</span>
                        <span className="font-black text-[#00F5D4] text-xs">Total: ₹{Number(ord.total).toFixed(2)}</span>
                      </div>

                      {/* Re-order Button */}
                      {onReOrder && ord.items && ord.items.length > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              onReOrder(ord.items);
                              onClose();
                            }}
                            className="w-full py-2 bg-[#2B1C17] hover:bg-[#3A2720] border border-[#482F26] hover:border-[#00F5D4]/40 text-[#00F5D4] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm"
                          >
                            <RotateCcwIcon className="w-3.5 h-3.5 text-[#00F5D4]" />
                            <span>Re-order All {ord.items.length} Items</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
