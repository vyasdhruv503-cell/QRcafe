import React from 'react';
import type { CafeInfo, TableInfo } from '../../types';
import { Utensils, MapPin, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  cafe: CafeInfo;
  table: TableInfo;
  onStaffLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cafe, table, onStaffLogin }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-amber-950/5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Cafe Logo & Name */}
        <div className="flex items-center gap-3">
          {cafe.logo ? (
            <img
              src={cafe.logo}
              alt={cafe.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/20 shadow-xs"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-stone-900 leading-tight">{cafe.name}</h1>
            {cafe.address && (
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600" />
                <span className="truncate max-w-[180px]">{cafe.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Table Badge & Staff Portal */}
        <div className="flex items-center gap-2">
          {onStaffLogin && (
            <button
              onClick={onStaffLogin}
              title="Staff Portal Login"
              className="text-[11px] font-bold text-stone-600 hover:text-amber-600 bg-stone-100 hover:bg-amber-50 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-amber-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Staff</span>
            </button>
          )}

          <div className="bg-amber-100/80 border border-amber-300/50 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            {table.number}
          </div>
        </div>
      </div>
    </header>
  );
};
