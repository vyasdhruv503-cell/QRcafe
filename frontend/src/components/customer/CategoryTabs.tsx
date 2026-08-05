import React from 'react';
import type { Category } from '../../types';
import { Sparkles } from 'lucide-react';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 flex items-center gap-2 sticky top-[57px] z-20 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-stone-200/60 shadow-2xs">
      {/* "All" Tab */}
      <button
        onClick={() => onSelectCategory('ALL')}
        className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 ${
          selectedCategoryId === 'ALL'
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25 shadow-md scale-[1.02]'
            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        All Menu
      </button>

      {/* Dynamic Categories */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs active:scale-95 ${
              isSelected
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25 shadow-md scale-[1.02]'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
