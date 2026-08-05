import React, { useEffect, useState } from 'react';
import type { OrderRecord, AuthUser } from '../types';
import { api } from '../services/api';
import { KitchenOrderCard } from '../components/kitchen/KitchenOrderCard';
import { ChefHat, RefreshCw, LogOut, ArrowLeft, ExternalLink } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchKitchenOrders = async () => {
    try {
      const data = await api.getKitchenOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 5000); // 5s KDS polling refresh
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.advanceKitchenStatus(orderId, nextStatus);
      fetchKitchenOrders();
    } catch (err) {
      console.error('Failed to advance order status:', err);
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
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col">
      {/* Top KDS Bar */}
      <header className="bg-stone-950 border-b border-stone-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between sticky top-0 z-20 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">Kitchen Display System</h1>
            <p className="text-[11px] text-amber-500 font-semibold">Real-Time Kitchen Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onNavigateToAdmin && user?.role === 'ADMIN' && (
            <Button variant="ghost" size="sm" onClick={onNavigateToAdmin} className="text-stone-300 text-xs px-2.5">
              <ArrowLeft className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}

          {onNavigateToMenu && (
            <Button variant="ghost" size="sm" onClick={onNavigateToMenu} className="text-amber-400 font-bold hover:text-amber-300 text-xs px-2.5">
              <ExternalLink className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          )}

          <button
            onClick={fetchKitchenOrders}
            className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl border border-stone-800 transition-colors"
            title="Refresh Live Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 rounded-xl border border-stone-800 transition-colors"
            title="Logout Staff"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Stage Filter Tabs (Visible on Mobile Screens) */}
      <div className="lg:hidden bg-stone-950/90 border-b border-stone-800 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedMobileTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedMobileTab === 'ALL'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-800 text-stone-400'
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedMobileTab === col.key
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-400'
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
                  className="bg-stone-950/70 rounded-3xl p-4 border border-stone-800 flex flex-col"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${col.color}`} />
                      <h2 className="text-sm font-black uppercase tracking-wider text-stone-200">
                        {col.title}
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-xs font-bold">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Column Cards List */}
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
                    {colOrders.length === 0 ? (
                      <div className="text-center py-10 text-stone-600 text-xs font-semibold">
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
