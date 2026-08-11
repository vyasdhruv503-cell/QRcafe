import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00F5D4]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search menu items (e.g. Chai, Pizza, Burger)..."
        className="w-full bg-[#1F1512] border border-[#38241D] rounded-2xl pl-10 pr-10 py-2.5 text-sm text-stone-100 placeholder-stone-500 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00F5D4]/40 focus:border-[#00F5D4] transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
