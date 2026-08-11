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
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-md mx-auto animate-slideUp">
      <button
        onClick={onOpenCart}
        className="w-full bg-gradient-to-r from-[#211612] via-[#2A1D18] to-[#211612] text-white p-3.5 rounded-3xl shadow-2xl border border-[#442D24] flex items-center justify-between transition-all active:scale-[0.98] group box-glow-green"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00F5D4] to-[#10B981] flex items-center justify-center font-bold text-sm text-[#140D0B] shadow-md box-glow-green group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-[#140D0B]" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-semibold text-stone-400">
              {itemCount} {itemCount === 1 ? 'Dish' : 'Dishes'} in cart
            </p>
            <p className="text-base font-black text-[#00F5D4] tracking-tight leading-none mt-0.5">
              {cafe.currency}
              {subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-[#00F5D4] to-[#10B981] text-[#140D0B] px-4 py-2.5 rounded-2xl shadow-md group-hover:translate-x-1 transition-transform">
          <span>Checkout</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      </button>
    </div>
  );
};
