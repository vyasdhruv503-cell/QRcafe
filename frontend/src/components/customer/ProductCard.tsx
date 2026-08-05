import React from 'react';
import type { Product } from '../../types';
import { Plus, Minus, Clock, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: string;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onClickDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart,
  onClickDetail,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 p-3.5 flex gap-3 shadow-2xs hover:shadow-xs transition-all">
      {/* Product Image */}
      <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onClickDetail(product)}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-amber-50 font-bold text-xs">
            No Image
          </div>
        )}
        {/* Featured Badge */}
        {product.isFeatured && (
          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
            <Star className="w-2.5 h-2.5 fill-current" />
            Chef Special
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {/* Veg / Non-Veg Indicator */}
            <span
              className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-[2px] ${
                product.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  product.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>
            <h3
              onClick={() => onClickDetail(product)}
              className="text-sm font-bold text-stone-900 truncate hover:text-amber-600 cursor-pointer transition-colors"
            >
              {product.name}
            </h3>
          </div>

          {product.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer: Price & Add Controls */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-100">
          <div>
            <span className="text-sm font-extrabold text-stone-900">
              {currency}
              {product.price.toFixed(2)}
            </span>
            {product.preparationTime && (
              <span className="text-[11px] text-stone-400 flex items-center gap-0.5 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {product.preparationTime}m
              </span>
            )}
          </div>

          {/* Add / Quantity Buttons */}
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300/60 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs overflow-hidden">
              <button
                onClick={() => onRemoveFromCart(product)}
                className="px-2.5 py-1.5 hover:bg-amber-700 active:bg-amber-800 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-extrabold">{cartQuantity}</span>
              <button
                onClick={() => onAddToCart(product)}
                className="px-2.5 py-1.5 hover:bg-amber-700 active:bg-amber-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
