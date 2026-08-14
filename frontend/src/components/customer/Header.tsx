import React from 'react';
import type { CafeInfo, TableInfo } from '../../types';
import { Utensils, MapPin, History } from 'lucide-react';

interface HeaderProps {
  cafe: CafeInfo;
  table: TableInfo;
  onOpenOrderHistory?: () => void;
  orderHistoryCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  cafe,
  table,
  onOpenOrderHistory,
  orderHistoryCount = 0,
}) => {
  return (
    <header className="bg-[#170E0B]/95 text-white backdrop-blur-md border-b border-[#38241D] sticky top-0 z-30 shadow-xl h-16">
      <div className="max-w-3xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Teawala Dark Brown Signboard Brand Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 px-2.5 rounded-2xl bg-[#251713] border border-[#4A3228] flex items-center justify-center shrink-0 shadow-md">
            <img src="/logo.png" alt="TeaWala Logo" className="h-7 w-auto object-contain" />
          </div>

          <div className="min-w-0">
            {/* Glowing Brand Title matching the store sign */}
            <div className="flex items-center gap-1.5">
              <span className="text-glow-green font-black text-xl tracking-tight">tea</span>
              <span className="text-glow-white font-black text-xl tracking-tight">wala</span>
              <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full box-glow-amber mx-1 inline-block shrink-0" />
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-stone-300 font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                {cafe.name}
              </span>
              <span className="bg-[#00F5D4]/20 text-[#00F5D4] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#00F5D4]/40 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
                OPEN
              </span>
            </div>
          </div>
        </div>

        {/* Right Badge Controls */}
        <div className="flex items-center gap-2">
          {onOpenOrderHistory && (
            <button
              onClick={onOpenOrderHistory}
              className="relative bg-[#251814] hover:bg-[#33221B] text-stone-200 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-[#422C24] active:scale-95 shadow-sm"
              title="View Order History"
            >
              <History className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span className="hidden sm:inline">My Orders</span>
              {orderHistoryCount > 0 && (
                <span className="w-4 h-4 bg-[#00F5D4] text-[#140D0B] rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  {orderHistoryCount}
                </span>
              )}
            </button>
          )}

          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-1.5 shrink-0 border border-amber-400/40">
            <span className="w-2 h-2 rounded-full bg-stone-950 animate-pulse" />
            {table.number}
          </div>
        </div>
      </div>
    </header>
  );
};
