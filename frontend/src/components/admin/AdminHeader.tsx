import React from 'react';
import type { AuthUser } from '../../types';
import { Store, ChefHat, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

interface AdminHeaderProps {
  title: string;
  user: AuthUser | null;
  onNavigateToKitchen?: () => void;
  onNavigateToMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  user,
  onNavigateToKitchen,
  onNavigateToMenu,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      <div>
        <h1 className="text-xl font-extrabold text-stone-900">{title}</h1>
        <p className="text-xs text-stone-500 mt-0.5">Manage your cafe operations and real-time orders</p>
      </div>

      <div className="flex items-center gap-3">
        {onNavigateToKitchen && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onNavigateToKitchen}
            className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 font-bold"
          >
            <ChefHat className="w-4 h-4 text-amber-600" />
            Kitchen KDS
          </Button>
        )}

        {onNavigateToMenu && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToMenu}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            Customer Menu
          </Button>
        )}

        <div className="flex items-center gap-2 bg-stone-100 text-stone-800 border border-stone-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
          <Store className="w-4 h-4 text-amber-600" />
          <span>{user?.cafeName || 'My Cafe'}</span>
        </div>
      </div>
    </header>
  );
};
