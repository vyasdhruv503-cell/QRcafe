import React, { useEffect, useState } from 'react';
import type { AuthUser, Product, Category, TableInfo, OrderRecord, CafeInfo } from '../types';
import { api } from '../services/api';
import { Sidebar } from '../components/admin/Sidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { StatCard } from '../components/admin/StatCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { QRPreviewModal } from '../components/admin/QRPreviewModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  QrCode,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Calendar,
  History,
  IdCard,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AdminDashboardPageProps {
  user: AuthUser;
  onLogout: () => void;
  onNavigateToKitchen: () => void;
  onNavigateToMenu?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  user,
  onLogout,
  onNavigateToKitchen,
  onNavigateToMenu,
}) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [settings, setSettings] = useState<CafeInfo | null>(null);

  // Filters & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  const [selectedQRTable, setSelectedQRTable] = useState<TableInfo | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Confirmation Delete Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'product' | 'category' | 'staff';
    id: string;
    name: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Load tab data dynamically
  const loadTabData = async () => {
    setIsLoading(true);
    try {
      if (currentTab === 'dashboard') {
        const res = await api.getDashboard();
        setDashboardData(res);
      } else if (currentTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          api.getAdminProducts(),
          api.getAdminCategories(),
        ]);
        setProducts(prodRes);
        setCategories(catRes);
      } else if (currentTab === 'categories') {
        const res = await api.getAdminCategories();
        setCategories(res);
      } else if (currentTab === 'tables') {
        const [tblRes, cafeRes] = await Promise.all([api.getAdminTables(), api.getSettings()]);
        setTables(tblRes);
        setSettings(cafeRes);
      } else if (currentTab === 'orders' || currentTab === 'history') {
        const res = await api.getAdminOrders(orderStatusFilter, orderSearchQuery, orderDateFilter);
        setOrders(res);
      } else if (currentTab === 'staff') {
        const res = await api.getStaff();
        setStaff(res);
      } else if (currentTab === 'settings') {
        const res = await api.getSettings();
        setSettings(res);
      }
    } catch (err) {
      console.error('Error loading tab data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'kitchen') {
      onNavigateToKitchen();
    } else {
      loadTabData();
    }
  }, [currentTab, orderStatusFilter, orderSearchQuery, orderDateFilter]);

  // Product Form Handler
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      categoryId: formData.get('categoryId') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string,
      isAvailable: formData.get('isAvailable') === 'on',
      isFeatured: formData.get('isFeatured') === 'on',
      isVeg: formData.get('isVeg') === 'on',
      preparationTime: parseInt(formData.get('preparationTime') as string) || 15,
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, data);
    } else {
      await api.createProduct(data);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    loadTabData();
  };

  // Category Form Handler
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      image: formData.get('image') as string,
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      isActive: formData.get('isActive') === 'on',
    };

    if (editingCategory) {
      await api.updateCategory(editingCategory.id, data);
    } else {
      await api.createCategory(data);
    }

    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    loadTabData();
  };

  // Table Form Handler
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;
    await api.createTable(newTableNumber, newTableCapacity);
    setIsTableModalOpen(false);
    setNewTableNumber('');
    loadTabData();
  };

  // Staff Form Handler
  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await api.createStaff({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
    });
    setIsStaffModalOpen(false);
    loadTabData();
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await api.updateSettings({
      name: formData.get('name') as string,
      logo: formData.get('logo') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      taxRate: parseFloat(formData.get('taxRate') as string),
      currency: formData.get('currency') as string,
    });
    loadTabData();
  };

  // Confirm Delete Handler
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'product') {
      await api.deleteProduct(deleteConfirm.id);
    } else if (deleteConfirm.type === 'category') {
      await api.deleteCategory(deleteConfirm.id);
    } else if (deleteConfirm.type === 'staff') {
      await api.deleteStaff(deleteConfirm.id);
    }
    setDeleteConfirm(null);
    loadTabData();
  };

  return (
    <div className="flex min-h-screen bg-stone-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={
            currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace('-', ' ') + (isLoading ? ' (Syncing...)' : '')
          }
          user={user}
          onNavigateToKitchen={onNavigateToKitchen}
          onNavigateToMenu={onNavigateToMenu}
        />

        <main className="p-8 flex-1 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && dashboardData && (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Today's Revenue"
                  value={`₹${dashboardData.metrics.todaySales.toFixed(2)}`}
                  subtitle={`${dashboardData.metrics.todayOrders} orders today`}
                  icon={DollarSign}
                  color="amber"
                />
                <StatCard
                  title="Active Orders"
                  value={
                    dashboardData.metrics.pendingOrders +
                    dashboardData.metrics.preparingOrders
                  }
                  subtitle={`${dashboardData.metrics.pendingOrders} pending kitchen approval`}
                  icon={Clock}
                  color="indigo"
                />
                <StatCard
                  title="Completed Orders"
                  value={dashboardData.metrics.completedOrders}
                  subtitle={`Out of ${dashboardData.metrics.totalOrders} total orders`}
                  icon={ShoppingBag}
                  color="emerald"
                />
                <StatCard
                  title="Menu Products"
                  value={dashboardData.metrics.totalProducts}
                  subtitle={`${dashboardData.metrics.totalTables} active QR tables`}
                  icon={UtensilsCrossed}
                  color="blue"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Revenue Trend (Recharts) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs">
                  <h3 className="text-base font-extrabold text-stone-900 mb-4">
                    7-Day Revenue Overview
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.salesTrend}>
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#d97706"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#salesGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs">
                  <h3 className="text-base font-extrabold text-stone-900 mb-4">
                    Top Selling Products
                  </h3>
                  <div className="space-y-4">
                    {dashboardData.popularProducts.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-100"
                      >
                        <div>
                          <p className="text-xs font-bold text-stone-900">{item.name}</p>
                          <p className="text-[11px] text-stone-500">{item.quantity} sold</p>
                        </div>
                        <span className="text-xs font-extrabold text-amber-700">
                          ₹{item.revenue.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {currentTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-800">Menu Products List</h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add New Product
                </Button>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          {p.image && (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          )}
                          <div>
                            <p className="font-bold text-stone-900">{p.name}</p>
                            {p.isFeatured && (
                              <span className="text-[10px] text-amber-700 font-bold">
                                ★ Featured Special
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-stone-600">
                          {p.categoryName || 'Unassigned'}
                        </td>
                        <td className="p-4 font-extrabold text-stone-900">₹{p.price.toFixed(2)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${p.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            {p.isVeg ? 'VEG' : 'NON-VEG'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={async () => {
                              await api.toggleProduct(p.id);
                              loadTabData();
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${p.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-600'
                              }`}
                          >
                            {p.isAvailable ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                            {p.isAvailable ? 'Available' : 'Disabled'}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ type: 'product', id: p.id, name: p.name })
                            }
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {currentTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-800">Menu Categories</h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Category
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      {c.image && (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-32 rounded-2xl object-cover mb-4"
                        />
                      )}
                      <h3 className="text-base font-extrabold text-stone-900">{c.name}</h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{c.description}</p>
                      <p className="text-xs font-bold text-amber-700 mt-3">
                        {c.productCount || 0} Products
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                      <span className="text-xs font-semibold text-stone-400">Order: #{c.sortOrder}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(c);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ type: 'category', id: c.id, name: c.name })
                          }
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TABLES & QR CODES */}
          {currentTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-800">Cafe Seating Tables</h2>
                <Button variant="primary" onClick={() => setIsTableModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Seating Table
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center font-black text-base shadow-2xs">
                        {t.number.replace('Table ', '')}
                      </div>
                      <span className="text-xs font-bold bg-stone-100 px-3 py-1 rounded-xl text-stone-600">
                        Cap: {t.capacity} guests
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-stone-900">{t.number}</h3>
                      <p className="text-xs font-mono text-stone-400 mt-1 truncate">
                        Token: {t.qrToken}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={async () => {
                          await api.regenerateQR(t.id);
                          loadTabData();
                        }}
                        className="text-xs text-stone-500 hover:text-amber-600 font-semibold flex items-center gap-1"
                        title="Regenerate QR Token"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Token
                      </button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedQRTable(t)}
                        className="flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        Print / View QR
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & ORDER HISTORY */}
          {(currentTab === 'orders' || currentTab === 'history') && (
            <div className="space-y-6">
              {/* Header & Date Filter Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
                <div>
                  <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                    {currentTab === 'history' ? (
                      <>
                        <History className="w-5 h-5 text-amber-600" />
                        Order History & Historical Logs
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 text-amber-600" />
                        Live Orders Management
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium mt-0.5">
                    Filter by status, search by customer/phone/table, or pick a specific date.
                  </p>
                </div>

                {/* Date Picker Control & Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                    <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
                    <input
                      type="date"
                      value={orderDateFilter}
                      onChange={(e) => setOrderDateFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none"
                    />
                    {orderDateFilter && (
                      <button
                        onClick={() => setOrderDateFilter('')}
                        className="text-stone-400 hover:text-stone-700"
                        title="Clear Date Filter"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      setOrderDateFilter(todayStr);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${orderDateFilter === new Date().toISOString().split('T')[0]
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                  >
                    Today
                  </button>

                  <button
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setOrderDateFilter(d.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100 transition-all"
                  >
                    Yesterday
                  </button>

                  {orderDateFilter && (
                    <button
                      onClick={() => setOrderDateFilter('')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
                    >
                      Show All Dates
                    </button>
                  )}
                </div>
              </div>

              {/* Order Status Filters & Search Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                  {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${orderStatusFilter === st
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200'
                          }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order/phone/table..."
                    className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Order Summary Stats for Filtered Date */}
              {orderDateFilter && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>📅 Filtered Date: {orderDateFilter}</span>
                  <span>Total Orders: {orders.length}</span>
                  <span>
                    Total Revenue: ₹
                    {orders
                      .filter((o) => o.orderStatus !== 'CANCELLED')
                      .reduce((sum, o) => sum + o.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}

              {/* Orders Table */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Table</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-400 font-semibold">
                          No orders found matching your date or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-4 font-bold text-stone-900">#{o.orderNumber}</td>
                          <td className="p-4 text-stone-500 whitespace-nowrap">
                            {new Date(o.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            <span className="text-[11px] text-stone-400">
                              {new Date(o.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-amber-700">{o.tableNumber}</td>
                          <td className="p-4">{o.customerName || 'Guest'}</td>
                          <td className="p-4 max-w-xs">
                            {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </td>
                          <td className="p-4 font-black text-stone-900">₹{o.total.toFixed(2)}</td>
                          <td className="p-4">
                            <StatusBadge status={o.orderStatus} />
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={o.orderStatus}
                              onChange={async (e) => {
                                await api.updateOrderStatus(o.id, e.target.value);
                                loadTabData();
                              }}
                              className="bg-stone-50 border border-stone-300 rounded-xl px-2 py-1 text-xs font-bold text-stone-800 focus:outline-none"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY">READY</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: STAFF */}
          {currentTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-800">Staff Accounts</h2>
                <Button variant="primary" onClick={() => setIsStaffModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Staff Account
                </Button>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Staff ID</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {staff.map((s, index) => (
                      <tr key={s.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4 font-bold text-stone-900">{s.name}</td>
                        <td className="p-4 font-mono text-stone-600">{s.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${s.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                          >
                            {s.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="bg-stone-900 text-amber-400 font-mono text-xs font-black px-2.5 py-1 rounded-xl shadow-2xs inline-flex items-center gap-1.5 border border-stone-800">
                            <IdCard className="w-3.5 h-3.5 text-amber-500" />
                            {s.staffId || `STF-${(101 + index).toString().padStart(3, '0')}`}
                          </span>
                        </td>
                        <td className="p-4 text-stone-400">
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                            : new Date().toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          {s.id !== user.id ? (
                            <button
                              onClick={() => setDeleteConfirm({ type: 'staff', id: s.id, name: s.name })}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ml-auto"
                              title="Delete Staff Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-400 font-semibold italic bg-stone-100 px-2 py-1 rounded-lg">
                              Current User
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {currentTab === 'settings' && settings && (
            <div className="max-w-2xl bg-white rounded-3xl p-8 border border-stone-200 shadow-2xs">
              <h2 className="text-lg font-black text-stone-900 mb-6">Cafe Configuration Settings</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <Input label="Cafe Name" name="name" defaultValue={settings.name} required />
                <Input label="Logo Image URL" name="logo" defaultValue={settings.logo || ''} />
                <Input label="Address" name="address" defaultValue={settings.address || ''} />
                <Input label="Phone Number" name="phone" defaultValue={settings.phone || ''} />
                <Input label="Email" name="email" defaultValue={settings.email || ''} />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Tax Percentage (%)"
                    name="taxRate"
                    type="number"
                    step="0.01"
                    defaultValue={settings.taxRate}
                    required
                  />
                  <Input label="Currency Symbol" name="currency" defaultValue={settings.currency} required />
                </div>

                <Button variant="primary" type="submit" className="py-3 text-sm">
                  Save Store Settings
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}
      {/* Product Form Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-600 mb-1">Category</label>
            <select
              name="categoryId"
              defaultValue={editingProduct?.categoryId || categories[0]?.id}
              className="w-full bg-white border border-stone-200 rounded-xl p-2.5"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Product Name" name="name" defaultValue={editingProduct?.name} required />
          <Input
            label="Description"
            name="description"
            defaultValue={editingProduct?.description || ''}
          />
          <Input
            label="Price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={editingProduct?.price}
            required
          />
          <Input
            label="Image URL"
            name="image"
            defaultValue={editingProduct?.image || ''}
          />
          <Input
            label="Preparation Time (mins)"
            name="preparationTime"
            type="number"
            defaultValue={editingProduct?.preparationTime || 15}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                name="isVeg"
                defaultChecked={editingProduct ? editingProduct.isVeg : true}
              />
              Is Veg
            </label>
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={editingProduct ? editingProduct.isAvailable : true}
              />
              Is Available
            </label>
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={editingProduct?.isFeatured}
              />
              Featured Special
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Form Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <Input label="Category Name" name="name" defaultValue={editingCategory?.name} required />
          <Input
            label="Description"
            name="description"
            defaultValue={editingCategory?.description || ''}
          />
          <Input label="Image URL" name="image" defaultValue={editingCategory?.image || ''} />
          <Input
            label="Sort Order"
            name="sortOrder"
            type="number"
            defaultValue={editingCategory?.sortOrder || 0}
          />
          <label className="flex items-center gap-2 font-bold cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={editingCategory ? editingCategory.isActive : true}
            />
            Active Category
          </label>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Table Form Modal */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="Add Seating Table"
      >
        <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
          <Input
            label="Table Identifier (e.g. Table 07)"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            required
          />
          <Input
            label="Guest Capacity"
            type="number"
            value={newTableCapacity}
            onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 4)}
            required
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsTableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate & Save Table
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Form Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Add Staff Account"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
          <div className="p-3 bg-stone-900 text-stone-200 rounded-2xl flex items-center justify-between shadow-xs">
            <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-amber-500" />
              Staff ID Generation:
            </span>
            <span className="font-mono font-black text-amber-400 text-xs px-2.5 py-1 bg-stone-800 rounded-xl border border-stone-700">
              Auto-Generated (e.g. STF-{(101 + staff.length).toString().padStart(3, '0')})
            </span>
          </div>
          <Input label="Full Name" name="name" required />
          <Input label="Email Address" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required />
          <div>
            <label className="block font-bold text-stone-600 mb-1">Assigned Role</label>
            <select name="role" className="w-full bg-white border border-stone-200 rounded-xl p-2.5">
              <option value="ADMIN">ADMIN</option>
              <option value="KITCHEN">KITCHEN</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Staff User
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Preview & Print Modal */}
      <QRPreviewModal
        table={selectedQRTable}
        cafe={settings}
        isOpen={Boolean(selectedQRTable)}
        onClose={() => setSelectedQRTable(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleExecuteDelete}
        title={`Delete ${deleteConfirm?.type}`}
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
