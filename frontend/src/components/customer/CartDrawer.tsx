import React, { useState } from 'react';
import type { CartItem, CafeInfo, TableInfo } from '../../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, User, Phone, FileText } from 'lucide-react';
import { Button } from '../common/Button';

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
  const [paymentMethod, setPaymentMethod] = useState('PAY_AT_COUNTER');
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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-base font-bold">Your Order Cart</h2>
                <p className="text-xs text-stone-400">
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
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {submitError}
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
                  Add delicious food items from the menu to build your order!
                </p>
                <Button variant="primary" size="sm" onClick={onClose}>
                  Explore Menu
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  {items.map(({ product, quantity, specialNote }) => (
                    <div
                      key={product.id}
                      className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 flex items-center gap-3 shadow-2xs"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{product.name}</h4>
                        <p className="text-xs font-extrabold text-amber-700 mt-0.5">
                          {cafe.currency}
                          {(product.price * quantity).toFixed(2)}
                        </p>
                        {specialNote && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                            Note: {specialNote}
                          </p>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-xl border border-stone-200 shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="p-1.5 hover:bg-stone-100 rounded-l-xl text-stone-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-extrabold text-stone-800">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="p-1.5 hover:bg-stone-100 rounded-r-xl text-stone-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optional Customer Information */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Customer Information (Optional)
                  </h3>

                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Mobile Number (Optional)"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <textarea
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Kitchen instructions or dietary requests..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Choice */}
                <div className="pt-3 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Payment Method
                  </h3>
                  <div>
                    <div className="p-3 rounded-xl border border-amber-600 bg-amber-50 text-amber-900 shadow-2xs text-xs font-bold flex items-center justify-between">
                      <span>Pay at Counter</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md uppercase font-extrabold">Default</span>
                    </div>
                  </div>
                </div>

                {/* Bill Breakdown Summary */}
                <div className="pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-800">
                      {cafe.currency}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST / Tax ({cafe.taxRate}%)</span>
                    <span className="font-semibold text-stone-800">
                      {cafe.currency}
                      {tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Grand Total</span>
                    <span className="text-amber-700">
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
            <div className="p-4 bg-stone-50 border-t border-stone-200">
              <Button
                variant="primary"
                className="w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-md"
                isLoading={isSubmitting}
                onClick={handleSubmit}
              >
                Place Order ({cafe.currency}
                {total.toFixed(2)})
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
