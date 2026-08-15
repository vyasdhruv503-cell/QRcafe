import React, { useState } from 'react';
import type { CartItem, CafeInfo, TableInfo } from '../../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, User, Phone, FileText } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  cafe: CafeInfo;
  table: TableInfo;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (customerName: string, customerPhone: string, notes: string, paymentMethod: string) => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  cafe,
  table,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, _setPaymentMethod] = useState('PAY_AT_COUNTER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const tax = Number(((subtotal * cafe.taxRate) / 100).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onPlaceOrder(customerName, customerPhone, orderNotes, paymentMethod);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 max-h-[92vh] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-w-md w-full bg-[#140D0B] rounded-t-[32px] sm:rounded-none shadow-2xl flex flex-col overflow-hidden animate-slideUp border-l border-[#38241D]">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-[#170E0B]">
          <div className="w-12 h-1.5 bg-[#38241D] rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#170E0B] text-white flex items-center justify-between border-b border-[#38241D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#281A15] text-[#00F5D4] flex items-center justify-center font-bold box-glow-green border border-[#483027]">
              <ShoppingBag className="w-5 h-5 text-[#00F5D4]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">Your Order Cart</h2>
              <p className="text-xs text-stone-400 font-medium">
                {table.number} • {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-stone-400 hover:text-rose-400 font-medium underline mr-2 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#2A1D18] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#140D0B]">
          {submitError && (
            <div className="p-3 bg-rose-950/60 border border-rose-600 text-rose-300 text-xs font-semibold rounded-xl">
              {submitError}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#251814] rounded-full flex items-center justify-center mx-auto text-[#00F5D4] mb-4 box-glow-green border border-[#422C24]">
                <ShoppingBag className="w-8 h-8 text-[#00F5D4]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">
                Add delicious food items from the menu to build your order!
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-[#00F5D4] to-[#10B981] text-[#140D0B] rounded-2xl text-xs font-black box-glow-green"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                {items.map(({ product, quantity, specialNote }) => (
                  <div
                    key={product.id}
                    className="bg-[#1F1512] rounded-2xl p-3.5 border border-[#38241D] flex items-center gap-3 shadow-md"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                      <p className="text-xs font-extrabold text-[#00F5D4] mt-0.5">
                        {cafe.currency}
                        {(product.price * quantity).toFixed(2)}
                      </p>
                      {specialNote && (
                        <p className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md mt-1 inline-block">
                          Note: {specialNote}
                        </p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#2B1C17] rounded-xl border border-[#482F26]">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="p-1.5 hover:bg-[#38251E] rounded-l-xl text-[#00F5D4] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-extrabold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          className="p-1.5 hover:bg-[#38251E] rounded-r-xl text-[#00F5D4] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Customer Information */}
              <div className="pt-4 border-t border-[#38241D] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00F5D4]">
                  Customer Information (Optional)
                </h3>

                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F5D4]" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="w-full bg-[#1F1512] border border-[#38241D] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#00F5D4]/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F5D4]" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Mobile Number (Optional)"
                      className="w-full bg-[#1F1512] border border-[#38241D] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#00F5D4]/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-[#00F5D4]" />
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Kitchen instructions or dietary requests..."
                      className="w-full bg-[#1F1512] border border-[#38241D] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#00F5D4]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Choice */}
              <div className="pt-3 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00F5D4]">
                  Payment Method
                </h3>
                <div>
                  <div className="p-3 rounded-xl border border-[#00F5D4]/40 bg-[#1F1512] text-white shadow-xs text-xs font-bold flex items-center justify-between">
                    <span>Pay at Counter</span>
                    <span className="text-[10px] bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40 px-2 py-0.5 rounded-md uppercase font-extrabold">Default</span>
                  </div>
                </div>
              </div>

              {/* Bill Breakdown Summary */}
              <div className="pt-4 border-t border-[#38241D] space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">
                    {cafe.currency}
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Tax ({cafe.taxRate}%)</span>
                  <span className="font-semibold text-white">
                    {cafe.currency}
                    {tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-[#38241D]">
                  <span>Grand Total</span>
                  <span className="text-[#00F5D4]">
                    {cafe.currency}
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer CTA */}
        {items.length > 0 && (
          <div className="p-4 bg-[#170E0B] border-t border-[#38241D]">
            <button
              className="w-full py-3.5 text-base flex items-center justify-center gap-2 bg-gradient-to-r from-[#00F5D4] to-[#10B981] text-[#140D0B] font-black rounded-2xl box-glow-green transition-all active:scale-[0.98]"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              Place Order ({cafe.currency}
              {total.toFixed(2)})
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
      </div>
    );
};
