import React, { useState } from 'react';
import type { Product } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Clock, Plus, Minus, FileText } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, note?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity, specialNote);
    setQuantity(1);
    setSpecialNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="-m-6 bg-[#140D0B] text-white">
        {/* Product Hero Image */}
        {product.image && (
          <div className="relative w-full h-56 bg-[#211612] overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140D0B] to-transparent" />
            <span
              className={`absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold text-white backdrop-blur-md ${
                product.isVeg ? 'bg-emerald-900/90 text-[#00F5D4] border border-emerald-500/40' : 'bg-rose-900/90 text-rose-200 border border-rose-500/40'
              }`}
            >
              {product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-black text-white">{product.name}</h2>
            <span className="text-lg font-black text-[#00F5D4]">
              {currency}
              {product.price.toFixed(2)}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-stone-300 leading-relaxed mb-4 font-medium">{product.description}</p>
          )}

          {product.preparationTime && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#251814] text-[#00F5D4] border border-[#3E2922] rounded-lg text-xs font-semibold mb-6">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Est. Preparation Time: {product.preparationTime} minutes
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#00F5D4] mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#00F5D4]" />
              Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Less spicy, extra sauce, no onions..."
              className="w-full bg-[#1F1512] border border-[#38241D] rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#00F5D4]/40"
            />
          </div>

          {/* Quantity Controls & Add Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-[#38241D]">
            <div className="flex items-center bg-[#2B1C17] rounded-xl border border-[#482F26]">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-[#38251E] rounded-l-xl transition-colors text-[#00F5D4]"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>
              <span className="px-4 text-sm font-extrabold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 hover:bg-[#38251E] rounded-r-xl transition-colors text-[#00F5D4]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <button
              className="flex-1 py-3 text-sm bg-gradient-to-r from-[#00F5D4] to-[#10B981] text-[#140D0B] font-black rounded-2xl box-glow-green active:scale-95 transition-all"
              onClick={handleAdd}
            >
              Add to Order ({currency}
              {(product.price * quantity).toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
