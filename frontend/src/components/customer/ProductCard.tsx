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
    <div className="bg-white rounded-3xl border border-stone-200/80 p-3.5 flex gap-3.5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
      {/* Product Image Container */}
      <div
        className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-stone-100 cursor-pointer shadow-xs group"
        onClick={() => onClickDetail(product)}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-amber-50 font-bold text-xs">
            No Image
          </div>
        )}

        {/* Featured Tag */}
        {product.isFeatured && (
          <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
            <Star className="w-2.5 h-2.5 fill-current" />
            Chef Special
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              {/* Veg / Non-Veg Indicator */}
              <span
                className={`w-4 h-4 rounded-md border flex items-center justify-center p-[2px] shrink-0 ${
                  product.isVeg ? 'border-emerald-600 bg-emerald-50' : 'border-rose-600 bg-rose-50'
                }`}
                title={product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </span>

              <h3
                onClick={() => onClickDetail(product)}
                className="text-sm font-black text-stone-900 line-clamp-1 hover:text-amber-600 cursor-pointer transition-colors leading-snug"
              >
                {product.name}
              </h3>
            </div>
          </div>

          {product.description && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer: Price & Add Controls */}
        <div className="flex items-end justify-between mt-2 pt-1 border-t border-stone-100">
          <div>
            <span className="text-sm font-black text-stone-900 tracking-tight">
              {currency}
              {product.price.toFixed(2)}
            </span>
            {product.preparationTime && (
              <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-0.5 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-amber-500" />
                ~{product.preparationTime} mins
              </span>
            )}
          </div>

          {/* Touch-Friendly Add / Stepper Controls */}
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 shadow-sm shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-stone-900 text-white rounded-2xl text-xs font-black shadow-md overflow-hidden border border-stone-800">
              <button
                onClick={() => onRemoveFromCart(product)}
                className="px-3 py-2 hover:bg-stone-800 active:bg-stone-700 transition-colors text-amber-400"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="px-2 text-xs font-black text-white">{cartQuantity}</span>
              <button
                onClick={() => onAddToCart(product)}
                className="px-3 py-2 hover:bg-stone-800 active:bg-stone-700 transition-colors text-amber-400"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
