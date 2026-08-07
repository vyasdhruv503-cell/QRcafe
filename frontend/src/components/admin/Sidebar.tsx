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
  X,
} from 'lucide-react';
import type { AuthUser } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: AuthUser | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  isOpen = false,
  onClose,
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

  const handleSelect = (id: string) => {
    onSelectTab(id);
    onClose?.();
  };

  const sidebarContent = (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col h-full border-r border-stone-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-stone-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide">CafeQR</h1>
            <p className="text-[11px] text-amber-500 font-medium">Smart Digital Menu</p>
          </div>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
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

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar - drawer overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative z-10 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
