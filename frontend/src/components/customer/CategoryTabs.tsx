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
    <div className="overflow-x-auto no-scrollbar py-3 -mx-4 px-4 flex items-center gap-2 sticky top-16 z-20 bg-[#170E0B]/95 backdrop-blur-md border-b border-[#38241D] shadow-md">
      {/* "All" Tab */}
      <button
        onClick={() => onSelectCategory('ALL')}
        className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
          selectedCategoryId === 'ALL'
            ? 'bg-gradient-to-r from-[#00F5D4] to-[#10B981] text-[#140D0B] box-glow-green scale-[1.02]'
            : 'bg-[#251814] text-stone-300 border border-[#3E2922] hover:bg-[#33221B] hover:text-white'
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
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 active:scale-95 shrink-0 ${
              isSelected
                ? 'bg-gradient-to-r from-[#00F5D4] to-[#10B981] text-[#140D0B] box-glow-green scale-[1.02]'
                : 'bg-[#251814] text-stone-300 border border-[#3E2922] hover:bg-[#33221B] hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
