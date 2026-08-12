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
    <aside className="w-64 bg-[#2C1E18] text-stone-300 flex flex-col h-full border-r border-[#3D2C24]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#3D2C24] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 px-2 bg-[#1F1411] border border-[#4D362C] rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <img src="/logo.png" alt="TeaWala Logo" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-wide">TeaWala</h1>
            <p className="text-[10px] text-[#76BC21] font-extrabold uppercase tracking-wider">EXOTIC. TRADITIONAL.</p>
          </div>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-stone-400 hover:text-white hover:bg-[#3D2C24] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#3D2C24] text-[#00F5D4] border border-[#00F5D4]/30 box-glow-green font-black shadow-sm'
                  : 'text-stone-400 hover:bg-[#3D2C24]/60 hover:text-stone-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F5D4]' : 'text-stone-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-[#3D2C24] bg-[#221611]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-black text-white truncate">{user?.name || 'Staff User'}</p>
            <p className="text-[10px] text-[#00F5D4] font-bold uppercase tracking-wider">{user?.role || 'ADMIN'}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-stone-400 hover:text-rose-400 hover:bg-[#3D2C24] rounded-xl transition-colors"
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
