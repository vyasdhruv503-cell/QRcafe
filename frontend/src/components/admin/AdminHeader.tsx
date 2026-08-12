import React from 'react';
import type { AuthUser } from '../../types';
import { Store, ChefHat, ExternalLink, Menu } from 'lucide-react';
import { Button } from '../common/Button';

interface AdminHeaderProps {
  title: string;
  user: AuthUser | null;
  onNavigateToKitchen?: () => void;
  onNavigateToMenu?: () => void;
  onOpenSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  user,
  onNavigateToKitchen,
  onNavigateToMenu,
  onOpenSidebar,
}) => {
  return (
    <header className="bg-white border-b border-[#E2DCD5] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger menu button for mobile */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-stone-600 hover:bg-[#F5EFE6] rounded-xl transition-colors shrink-0 border border-[#E2DCD5]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-[#10B981]" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-black text-[#1C130E] tracking-wide truncate flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#10B981] rounded-full inline-block shrink-0" />
            <span>{title}</span>
          </h1>
          <p className="hidden sm:block text-xs text-stone-500 font-medium mt-0.5">Manage your cafe operations and real-time orders</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onNavigateToKitchen && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateToKitchen}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 font-bold"
          >
            <ChefHat className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Kitchen KDS</span>
            <span className="md:hidden">Kitchen</span>
          </Button>
        )}

        {/* Mobile kitchen icon-only button */}
        {onNavigateToKitchen && (
          <button
            onClick={onNavigateToKitchen}
            className="sm:hidden p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 rounded-xl transition-colors"
            title="Kitchen KDS"
          >
            <ChefHat className="w-4 h-4 text-emerald-600" />
          </button>
        )}

        {onNavigateToMenu && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToMenu}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-700 border-[#D4C9BD] hover:bg-[#F5EFE6]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Customer Menu</span>
            <span className="md:hidden">Menu</span>
          </Button>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-[#FAF7F2] text-[#2C1E18] border border-[#E2DCD5] px-3.5 py-1.5 rounded-2xl text-xs font-bold">
          <Store className="w-4 h-4 text-[#10B981]" />
          <span>{user?.cafeName || 'TeaWala'}</span>
        </div>
      </div>
    </header>
  );
};
