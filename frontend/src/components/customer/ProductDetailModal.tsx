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
      <div className="-m-6">
        {/* Product Hero Image */}
        {product.image && (
          <div className="relative w-full h-56 bg-stone-100 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
            <span
              className={`absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold text-white backdrop-blur-md ${
                product.isVeg ? 'bg-emerald-600/90' : 'bg-rose-600/90'
              }`}
            >
              {product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-extrabold text-stone-900">{product.name}</h2>
            <span className="text-lg font-black text-amber-700">
              {currency}
              {product.price.toFixed(2)}
            </span>
          </div>

          {product.description && (
            <p className="text-sm text-stone-600 leading-relaxed mb-4">{product.description}</p>
          )}

          {product.preparationTime && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold mb-6">
              <Clock className="w-3.5 h-3.5" />
              Est. Preparation Time: {product.preparationTime} minutes
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Less spicy, extra sauce, no onions..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Quantity Controls & Add Button */}
          <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
            <div className="flex items-center bg-stone-100 rounded-xl border border-stone-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-stone-200 rounded-l-xl transition-colors text-stone-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-extrabold text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 hover:bg-stone-200 rounded-r-xl transition-colors text-stone-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button variant="primary" className="flex-1 py-3 text-sm" onClick={handleAdd}>
              Add to Order ({currency}
              {(product.price * quantity).toFixed(2)})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
