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
    <div className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 flex items-center gap-2">
      {/* "All" Tab */}
      <button
        onClick={() => onSelectCategory('ALL')}
        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
          selectedCategoryId === 'ALL'
            ? 'bg-amber-600 text-white shadow-amber-600/20 scale-[1.02]'
            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        All Items
      </button>

      {/* Dynamic Categories */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs ${
              isSelected
                ? 'bg-amber-600 text-white shadow-amber-600/20 scale-[1.02]'
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
