import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  UtensilsCrossed,
  Layers,
  QrCode,
  ChefHat,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import type { AuthUser } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: AuthUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'products', label: 'Products', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'tables', label: 'Tables & QRs', icon: QrCode },
    { id: 'kitchen', label: 'Kitchen View', icon: ChefHat },
    ...(user?.role === 'ADMIN' ? [{ id: 'staff', label: 'Staff Management', icon: Users }] : []),
    ...(user?.role === 'ADMIN' ? [{ id: 'settings', label: 'Cafe Settings', icon: Settings }] : []),
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-stone-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-extrabold shadow-md">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-wide">CafeQR</h1>
          <p className="text-[11px] text-amber-500 font-medium">Smart Digital Menu</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/40">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Staff User'}</p>
            <p className="text-[10px] text-amber-400 font-semibold uppercase">{user?.role || 'ADMIN'}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
