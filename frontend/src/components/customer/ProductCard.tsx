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
    <div className="bg-[#1F1512] rounded-3xl border border-[#38241D] p-3.5 flex gap-3.5 shadow-lg hover:border-[#00F5D4]/50 transition-all relative overflow-hidden group">
      {/* Product Image Container */}
      <div
        className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-[#2C1D18] cursor-pointer shadow-md"
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
          <div className="w-full h-full flex items-center justify-center text-stone-500 bg-[#281A15] font-bold text-xs">
            No Image
          </div>
        )}

        {/* Featured Tag */}
        {product.isFeatured && (
          <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs border border-amber-300/40">
            <Star className="w-2.5 h-2.5 fill-current text-stone-950" />
            Special
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Veg / Non-Veg Indicator */}
              <span
                className={`w-4 h-4 rounded-md border flex items-center justify-center p-[2px] shrink-0 ${
                  product.isVeg ? 'border-emerald-500 bg-emerald-950/60' : 'border-rose-500 bg-rose-950/60'
                }`}
                title={product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    product.isVeg ? 'bg-[#00F5D4]' : 'bg-rose-500'
                  }`}
                />
              </span>

              <h3
                onClick={() => onClickDetail(product)}
                className="text-sm font-black text-stone-100 line-clamp-1 hover:text-[#00F5D4] cursor-pointer transition-colors leading-snug"
              >
                {product.name}
              </h3>
            </div>
          </div>

          {product.description && (
            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-1 font-medium">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer: Price & Add Controls */}
        <div className="flex items-end justify-between mt-2 pt-2 border-t border-[#33221B]">
          <div>
            <span className="text-sm font-black text-[#00F5D4] tracking-tight">
              {currency}
              {product.price.toFixed(2)}
            </span>
            {product.preparationTime && (
              <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-0.5 mt-0.5">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                ~{product.preparationTime} mins
              </span>
            )}
          </div>

          {/* Touch-Friendly Add / Stepper Controls */}
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="px-4 py-2 bg-gradient-to-r from-[#00F5D4] to-[#10B981] hover:from-[#00E5C4] hover:to-[#0EA572] text-[#140D0B] rounded-2xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 box-glow-green"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#2B1C17] text-white rounded-2xl text-xs font-black shadow-md overflow-hidden border border-[#482F26]">
              <button
                onClick={() => onRemoveFromCart(product)}
                className="px-3 py-2 hover:bg-[#38251E] active:bg-[#452D24] transition-colors text-[#00F5D4]"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="px-2 text-xs font-black text-white">{cartQuantity}</span>
              <button
                onClick={() => onAddToCart(product)}
                className="px-3 py-2 hover:bg-[#38251E] active:bg-[#452D24] transition-colors text-[#00F5D4]"
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
