import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import type { CartItem, CafeInfo } from '../../types';

interface StickyCartBarProps {
  items: CartItem[];
  cafe: CafeInfo;
  onOpenCart: () => void;
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({ items, cafe, onOpenCart }) => {
  if (items.length === 0) return null;

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-lg mx-auto animate-slideUp">
      <button
        onClick={onOpenCart}
        className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-amber-100">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} selected
            </p>
            <p className="text-base font-extrabold leading-tight">
              {cafe.currency}
              {subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3.5 py-2 rounded-xl">
          View Cart
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
