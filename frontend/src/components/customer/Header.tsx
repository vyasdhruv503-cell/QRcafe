import React from 'react';
import type { CafeInfo, TableInfo } from '../../types';
import { Utensils, MapPin, ShieldCheck, Clock } from 'lucide-react';

interface HeaderProps {
  cafe: CafeInfo;
  table: TableInfo;
  onStaffLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cafe, table, onStaffLogin }) => {
  return (
    <header className="bg-stone-900/95 text-white backdrop-blur-md border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Cafe Logo & Info */}
        <div className="flex items-center gap-3">
          {cafe.logo ? (
            <img
              src={cafe.logo}
              alt={cafe.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs shrink-0 font-bold">
              <Utensils className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-stone-100 truncate">{cafe.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                OPEN
              </span>
            </div>
            {cafe.address && (
              <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate max-w-[170px]">{cafe.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Badge Controls */}
        <div className="flex items-center gap-2">
          {onStaffLogin && (
            <button
              onClick={onStaffLogin}
              title="Staff Portal Login"
              className="text-[11px] font-bold text-stone-300 hover:text-amber-400 bg-stone-800 hover:bg-stone-700 px-2.5 py-1.5 rounded-xl border border-stone-700 transition-all flex items-center gap-1 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Staff</span>
            </button>
          )}

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1.5 rounded-2xl text-xs font-black shadow-xs flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {table.number}
          </div>
        </div>
      </div>
    </header>
  );
};
