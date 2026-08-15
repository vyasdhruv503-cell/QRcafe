import React, { useEffect, useState } from 'react';
import type { OrderRecord, AuthUser } from '../types';
import { api } from '../services/api';
import { KitchenOrderCard } from '../components/kitchen/KitchenOrderCard';
import { RefreshCw, LogOut, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '../components/common/Button';

interface KitchenKDSPageProps {
  user: AuthUser | null;
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToMenu?: () => void;
}

export const KitchenKDSPage: React.FC<KitchenKDSPageProps> = ({
  user,
  onLogout,
  onNavigateToAdmin,
  onNavigateToMenu,
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const fetchKitchenOrders = async () => {
    try {
      const data = await api.getKitchenOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 5000); // 5s KDS polling refresh
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    // Optimistic UI state update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderToken === orderId
          ? { ...o, orderStatus: nextStatus as any }
          : o
      )
    );
    try {
      await api.advanceKitchenStatus(orderId, nextStatus);
      fetchKitchenOrders();
    } catch (err) {
      console.error('Failed to advance order status:', err);
      fetchKitchenOrders(); // Revert back on error
    }
  };

  const [selectedMobileTab, setSelectedMobileTab] = useState<string>('ALL');

  const columns = [
    { key: 'PENDING', title: 'New Orders', color: 'bg-amber-500' },
    { key: 'ACCEPTED', title: 'Accepted', color: 'bg-indigo-500' },
    { key: 'PREPARING', title: 'Preparing', color: 'bg-blue-500' },
    { key: 'READY', title: 'Ready to Serve', color: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C130E] flex flex-col font-sans">
      {/* Top KDS Bar */}
      <header className="bg-white border-b border-[#E2DCD5] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between sticky top-0 z-20 gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 px-2 bg-[#251713] border border-[#4A3228] rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <img src="/logo.png" alt="TeaWala Logo" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#1C130E] leading-tight flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#10B981] rounded-full inline-block" />
              Kitchen Display System
            </h1>
            <p className="text-[11px] text-[#10B981] font-bold tracking-wide">Real-Time Kitchen Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onNavigateToAdmin && user?.role === 'ADMIN' && (
            <Button variant="ghost" size="sm" onClick={onNavigateToAdmin} className="text-stone-600 hover:text-stone-900 text-xs px-3">
              <ArrowLeft className="w-4 h-4 sm:mr-1 text-[#10B981]" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}

          {onNavigateToMenu && (
            <Button variant="outline" size="sm" onClick={onNavigateToMenu} className="text-stone-700 border-[#D4C9BD] font-bold hover:bg-[#F5EFE6] text-xs px-3">
              <ExternalLink className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          )}

          <button
            onClick={fetchKitchenOrders}
            className="p-2 bg-[#F5EFE6] hover:bg-[#EAE2D5] text-[#10B981] rounded-2xl border border-[#E2DCD5] transition-colors"
            title="Refresh Live Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 bg-[#F5EFE6] hover:bg-rose-100 text-stone-500 hover:text-rose-600 rounded-2xl border border-[#E2DCD5] transition-colors"
            title="Logout Staff"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Stage Filter Tabs (Visible on Mobile Screens) */}
      <div className="lg:hidden bg-white border-b border-[#E2DCD5] px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedMobileTab('ALL')}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedMobileTab === 'ALL'
              ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-extrabold shadow-sm'
              : 'bg-[#F5EFE6] text-stone-600 border border-[#E2DCD5]'
          }`}
        >
          All Stages ({orders.length})
        </button>
        {columns.map((col) => {
          const count = orders.filter((o) => o.orderStatus === col.key).length;
          return (
            <button
              key={col.key}
              onClick={() => setSelectedMobileTab(col.key)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedMobileTab === col.key
                  ? 'bg-[#F5EFE6] text-[#10B981] border-[#10B981]/40 font-black'
                  : 'bg-white text-stone-600 border-[#E2DCD5]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Grid (Fully Responsive) */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {columns
            .filter((col) => selectedMobileTab === 'ALL' || selectedMobileTab === col.key)
            .map((col) => {
              const colOrders = orders.filter((o) => o.orderStatus === col.key);
              return (
                <div
                  key={col.key}
                  className="bg-[#F5EFE6]/70 rounded-3xl p-4 border border-[#E2DCD5] flex flex-col shadow-xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2DCD5]">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${col.color}`} />
                      <h2 className="text-xs font-black uppercase tracking-wider text-[#1C130E] flex items-center gap-1.5">
                        {col.title}
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E2DCD5] text-[#10B981] text-xs font-black shadow-2xs">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Column Cards List */}
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
                    {colOrders.length === 0 ? (
                      <div className="text-center py-10 text-stone-500 text-xs font-semibold">
                        No orders in this stage
                      </div>
                    ) : (
                      colOrders.map((ord) => (
                        <KitchenOrderCard
                          key={ord.id}
                          order={ord}
                          onAdvanceStatus={handleAdvanceStatus}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
};
