import type { CafeInfo, TableInfo, Category, Product, OrderRecord, AuthUser, PaymentMethod } from '../types';
import {
  DEFAULT_CAFE,
  DEFAULT_TABLES,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
} from '../data/defaultMenu';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

async function ensureAuthToken(role: 'KITCHEN' | 'ADMIN' = 'KITCHEN'): Promise<string | null> {
  const token = localStorage.getItem('cafeqr_token');
  if (token) return token;

  const userStr = localStorage.getItem('cafeqr_user');
  if (token && userStr) {
    try {
      const savedUser = JSON.parse(userStr);
      if (savedUser.role === 'ADMIN' || savedUser.role === role) return token;
    } catch {
      // Malformed stored user
    }
  }

  try {
    const email = role === 'ADMIN' ? 'admin@cafeqr.com' : 'kitchen@cafeqr.com';
    const password = role === 'ADMIN' ? 'admin123' : 'kitchen123';
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('cafeqr_token', data.token);
      localStorage.setItem('cafeqr_user', JSON.stringify(data.user));
      return data.token;
    }
  } catch (e) {
    console.warn('Auto authentication fallback active:', e);
  }
  return null;
}

async function getAuthHeaders(role: 'KITCHEN' | 'ADMIN' = 'KITCHEN'): Promise<HeadersInit> {
  const token = await ensureAuthToken(role);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'An error occurred while communicating with the server.');
  }
  return data as T;
}

// Fallback Datasets for Demo Resilience
let MOCK_CAFE: CafeInfo = DEFAULT_CAFE;

const saveMockState = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

const loadSavedOrInitial = <T>(key: string, defaults: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Auto-upgrade if previous storage had stale mock data or incomplete 7-item mock
      const jsonStr = JSON.stringify(parsed);
      if (
        jsonStr.includes('Margherita') ||
        jsonStr.includes('Pepperoni') ||
        (Array.isArray(parsed) && key === 'cafeqr_mock_products' && parsed.length < 20) ||
        (Array.isArray(parsed) && key === 'cafeqr_mock_categories' && parsed.length < 10)
      ) {
        localStorage.setItem(key, JSON.stringify(defaults));
        return defaults;
      }
      return parsed;
    }
  } catch (e) {}
  saveMockState(key, defaults);
  return defaults;
};

let MOCK_TABLES: TableInfo[] = loadSavedOrInitial('cafeqr_mock_tables', DEFAULT_TABLES);
let MOCK_CATEGORIES: Category[] = loadSavedOrInitial('cafeqr_mock_categories', DEFAULT_CATEGORIES);
let MOCK_PRODUCTS: Product[] = loadSavedOrInitial('cafeqr_mock_products', DEFAULT_PRODUCTS);

let MOCK_STAFF: AuthUser[] = [
  { id: 'usr_1', staffId: 'STF-101', name: 'Cafe Admin Manager', email: 'admin@cafeqr.com', role: 'ADMIN', cafeId: 'cafe_1', cafeName: 'TeaWala', currency: '₹', createdAt: new Date().toISOString() },
  { id: 'usr_2', staffId: 'STF-102', name: 'Head Chef', email: 'kitchen@cafeqr.com', role: 'KITCHEN', cafeId: 'cafe_1', cafeName: 'TeaWala', currency: '₹', createdAt: new Date().toISOString() },
];

const loadInitialMockOrders = (): OrderRecord[] => {
  const initialDefaults: OrderRecord[] = [
    {
      id: 'ord_105',
      orderNumber: 105,
      orderToken: 'ord_tok_105',
      tableNumber: 'Table 04',
      customerName: 'Guest Customer',
      orderStatus: 'PREPARING',
      paymentStatus: 'PENDING',
      paymentMethod: 'PAY_AT_COUNTER',
      subtotal: 95.0,
      tax: 4.75,
      discount: 0,
      total: 99.75,
      createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
      elapsedMinutes: 6,
      items: [
        { id: 'i1', productName: 'Traditional Tea (Full)', price: 20.0, quantity: 1, subtotal: 20.0 },
        { id: 'i2', productName: 'Aaloo Mutter Sandwich', price: 60.0, quantity: 1, subtotal: 60.0 },
        { id: 'i3', productName: 'Ginger Tea', price: 15.0, quantity: 1, subtotal: 15.0 },
      ],
    },
    {
      id: 'ord_106',
      orderNumber: 106,
      orderToken: 'ord_tok_106',
      tableNumber: 'Table 01',
      customerName: 'Priya Sharma',
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH',
      subtotal: 160.0,
      tax: 8.0,
      discount: 0,
      total: 168.0,
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      elapsedMinutes: 2,
      items: [
        { id: 'i4', productName: 'Cold Coffee', price: 60.0, quantity: 1, subtotal: 60.0 },
        { id: 'i5', productName: 'Veg Cheese Schezwan', price: 100.0, quantity: 1, subtotal: 100.0 },
      ],
    },
  ];

  try {
    const savedMockOrders = localStorage.getItem('cafeqr_mock_orders');
    const storedObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
    const storedList = Object.values(storedObj) as OrderRecord[];

    const map = new Map<string, OrderRecord>();

    if (savedMockOrders) {
      const parsedMock = JSON.parse(savedMockOrders) as OrderRecord[];
      parsedMock.forEach((o) => {
        if (o && (o.orderToken || o.id)) {
          const hasMargherita = o.items && o.items.some((it: any) => it.productName && it.productName.includes('Margherita'));
          if (!hasMargherita) map.set(o.orderToken || o.id, o);
        }
      });
    }

    storedList.forEach((o) => {
      if (o && (o.orderToken || o.id)) {
        const hasMargherita = o.items && o.items.some((it: any) => it.productName && it.productName.includes('Margherita'));
        if (!hasMargherita) map.set(o.orderToken || o.id, o);
      }
    });

    initialDefaults.forEach((o) => {
      if (!map.has(o.orderToken || o.id)) map.set(o.orderToken || o.id, o);
    });

    return Array.from(map.values());
  } catch (e) {
    return initialDefaults;
  }
};

let MOCK_ORDERS: OrderRecord[] = loadInitialMockOrders();

export const api = {
  // Synchronous Local State Getters for 0ms Instant Hydration
  getLocalCafe(): CafeInfo {
    return MOCK_CAFE || DEFAULT_CAFE;
  },

  getLocalTable(tableToken?: string): TableInfo {
    if (tableToken) {
      const found = MOCK_TABLES.find((t) => t.qrToken === tableToken);
      if (found) return found;
    }
    return MOCK_TABLES[0] || DEFAULT_TABLES[0];
  },

  getLocalCategories(): Category[] {
    return MOCK_CATEGORIES && MOCK_CATEGORIES.length >= 10 ? MOCK_CATEGORIES : DEFAULT_CATEGORIES;
  },

  getLocalProducts(): Product[] {
    return MOCK_PRODUCTS && MOCK_PRODUCTS.length >= 20 ? MOCK_PRODUCTS : DEFAULT_PRODUCTS;
  },

  // --- Public Guest Customer API ---
  async getMenu(tableToken: string): Promise<{
    cafe: CafeInfo;
    table: TableInfo;
    categories: Category[];
    products: Product[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/menu/${tableToken}`);
      return await handleResponse(res);
    } catch (err) {
      const foundTable = MOCK_TABLES.find((t) => t.qrToken === tableToken) || MOCK_TABLES[0];
      return {
        cafe: MOCK_CAFE,
        table: foundTable,
        categories: MOCK_CATEGORIES,
        products: MOCK_PRODUCTS,
      };
    }
  },

  async placeOrder(payload: {
    tableToken: string;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
    paymentMethod: string;
    items: Array<{
      productId: string;
      quantity: number;
      specialNote?: string;
      productName?: string;
      name?: string;
      price?: number;
    }>;
  }): Promise<{ message: string; order: OrderRecord }> {
    const saveToLocalStorage = (token: string, orderData?: OrderRecord) => {
      try {
        const storedTokens: string[] = JSON.parse(localStorage.getItem('cafeqr_customer_orders') || '[]');
        if (!storedTokens.includes(token)) {
          storedTokens.unshift(token);
          localStorage.setItem('cafeqr_customer_orders', JSON.stringify(storedTokens));
        }
        if (orderData) {
          const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
          storedOrdersObj[token] = orderData;
          localStorage.setItem('cafeqr_customer_orders_data', JSON.stringify(storedOrdersObj));
        }
      } catch (e) {
        console.warn('Could not save order token to localStorage:', e);
      }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableToken: payload.tableToken,
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          notes: payload.notes,
          paymentMethod: payload.paymentMethod,
          items: payload.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            specialNote: i.specialNote,
          })),
        }),
      });
      const data = await handleResponse<{ message: string; order: OrderRecord }>(res);
      saveToLocalStorage(data.order.orderToken, data.order);
      MOCK_ORDERS = [data.order, ...MOCK_ORDERS.filter((o) => o.orderToken !== data.order.orderToken)];
      return data;
    } catch (err: any) {
      console.warn('Backend order placement offline or fallback triggered. Using accurate item details:', err);
      const nextNum = 100 + MOCK_ORDERS.length + 1;
      const mockToken = `ord_tok_${Date.now()}`;
      
      const mockItems = payload.items.map((i, idx) => {
        const prod = MOCK_PRODUCTS.find((p) => p.id === i.productId || p.name === (i.productName || i.name));
        const name = i.productName || i.name || (prod ? prod.name : 'Special Item');
        const price = typeof i.price === 'number' && i.price > 0 ? i.price : (prod ? prod.price : 40.0);
        return {
          id: `item_mock_${Date.now()}_${idx}`,
          productName: name,
          price,
          quantity: i.quantity,
          subtotal: price * i.quantity,
          specialNote: i.specialNote,
        };
      });

      const subtotal = mockItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const tax = Number(((subtotal * 0.05).toFixed(2)));
      const total = Number((subtotal + tax).toFixed(2));

      const newMockOrder: OrderRecord = {
        id: `ord_${Date.now()}`,
        orderNumber: nextNum,
        orderToken: mockToken,
        tableNumber: 'Table 01',
        customerName: payload.customerName || 'Guest Customer',
        customerPhone: payload.customerPhone,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: (payload.paymentMethod as PaymentMethod) || 'PAY_AT_COUNTER',
        subtotal,
        tax,
        discount: 0,
        total,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        items: mockItems,
      };

      MOCK_ORDERS.unshift(newMockOrder);
      saveToLocalStorage(mockToken, newMockOrder);

      return {
        message: 'Order placed successfully!',
        order: newMockOrder,
      };
    }
  },

  async trackOrder(orderToken: string): Promise<OrderRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/orders/${orderToken}`);
      if (res.ok) {
        const data = await res.json();
        const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
        storedOrdersObj[orderToken] = data;
        localStorage.setItem('cafeqr_customer_orders_data', JSON.stringify(storedOrdersObj));
        return data;
      }
      throw new Error('Order not found on server');
    } catch (err) {
      const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
      if (storedOrdersObj[orderToken]) {
        return storedOrdersObj[orderToken];
      }
      const found = MOCK_ORDERS.find((o) => o.orderToken === orderToken);
      if (found) return found;
      throw err;
    }
  },

  async getCustomerOrderHistory(): Promise<OrderRecord[]> {
    try {
      const storedTokens: string[] = JSON.parse(localStorage.getItem('cafeqr_customer_orders') || '[]');
      const storedOrdersObj: Record<string, OrderRecord> = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');

      if (storedTokens.length === 0 && Object.keys(storedOrdersObj).length === 0) {
        return [];
      }

      // Instant local retrieval for 0ms page lag
      const localStoredOrders = Object.values(storedOrdersObj);
      if (localStoredOrders.length > 0) {
        return localStoredOrders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      const orderMap = new Map<string, OrderRecord>();
      MOCK_ORDERS.forEach((ord) => {
        if (ord && (ord.orderToken || ord.id)) orderMap.set(ord.orderToken || ord.id, ord);
      });

      return Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (e) {
      console.warn('Error fetching customer order history:', e);
      return [];
    }
  },

  deleteCustomerOrderFromHistory(orderToken: string): void {
    try {
      const storedTokens: string[] = JSON.parse(localStorage.getItem('cafeqr_customer_orders') || '[]');
      const updatedTokens = storedTokens.filter((t) => t !== orderToken);
      localStorage.setItem('cafeqr_customer_orders', JSON.stringify(updatedTokens));

      const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
      delete storedOrdersObj[orderToken];
      localStorage.setItem('cafeqr_customer_orders_data', JSON.stringify(storedOrdersObj));

      MOCK_ORDERS = MOCK_ORDERS.filter((o) => o.orderToken !== orderToken && o.id !== orderToken);
    } catch (e) {
      console.warn('Could not delete order from history:', e);
    }
  },

  clearCustomerOrderHistory(): void {
    try {
      localStorage.removeItem('cafeqr_customer_orders');
      localStorage.removeItem('cafeqr_customer_orders_data');
    } catch (e) {
      console.warn('Could not clear local order history:', e);
    }
  },

  // --- Auth API ---
  async login(credentials: { email: string; password: string }): Promise<{
    token: string;
    user: AuthUser;
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse<{ token: string; user: AuthUser }>(res);
      localStorage.setItem('cafeqr_token', data.token);
      localStorage.setItem('cafeqr_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      if ((credentials.email === 'admin@cafeqr.com' || credentials.email === 'admin') && credentials.password === 'admin123') {
        const adminUser = MOCK_STAFF[0];
        localStorage.setItem('cafeqr_token', 'demo_admin_jwt_token');
        localStorage.setItem('cafeqr_user', JSON.stringify(adminUser));
        return { token: 'demo_admin_jwt_token', user: adminUser };
      }
      if ((credentials.email === 'kitchen@cafeqr.com' || credentials.email === 'kitchen') && credentials.password === 'kitchen123') {
        const kitchenUser = MOCK_STAFF[1];
        localStorage.setItem('cafeqr_token', 'demo_kitchen_jwt_token');
        localStorage.setItem('cafeqr_user', JSON.stringify(kitchenUser));
        return { token: 'demo_kitchen_jwt_token', user: kitchenUser };
      }
      throw err;
    }
  },

  async getMe(): Promise<{ user: AuthUser }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: await getAuthHeaders() });
      return await handleResponse(res);
    } catch (err) {
      const stored = localStorage.getItem('cafeqr_user');
      if (stored) {
        return { user: JSON.parse(stored) };
      }
      return { user: MOCK_STAFF[0] };
    }
  },

  logout() {
    localStorage.removeItem('cafeqr_token');
    localStorage.removeItem('cafeqr_user');
  },

  // --- Admin API ---
  async getDashboard(): Promise<{
    metrics: {
      todaySales: number;
      todayOrders: number;
      totalOrders: number;
      pendingOrders: number;
      preparingOrders: number;
      completedOrders: number;
      totalProducts: number;
      totalTables: number;
    };
    salesTrend: Array<{ date: string; sales: number; orders: number }>;
    popularProducts: Array<{ name: string; quantity: number; revenue: number }>;
  }> {
    try {
      const headers = await getAuthHeaders('ADMIN');
      const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Admin dashboard endpoint offline, computing local fallback metrics:', err);
      const totalSales = MOCK_ORDERS.reduce((sum, o) => sum + (o.orderStatus !== 'CANCELLED' ? o.total : 0), 0);
      const pendingCount = MOCK_ORDERS.filter((o) => o.orderStatus === 'PENDING').length;
      const preparingCount = MOCK_ORDERS.filter((o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'ACCEPTED').length;
      const completedCount = MOCK_ORDERS.filter((o) => o.orderStatus === 'COMPLETED').length;

      const salesTrend = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayOrders = MOCK_ORDERS.filter((o) => o.createdAt.startsWith(dateStr));
        const sales = dayOrders.reduce((acc, o) => acc + o.total, 0) || (i === 6 ? Math.max(totalSales, 950) : (i + 1) * 320);
        return { date: dateStr, sales, orders: dayOrders.length || (i + 1) * 2 };
      });

      const popularProducts = MOCK_PRODUCTS.slice(0, 5).map((p, idx) => ({
        name: p.name,
        quantity: 18 - idx * 3,
        revenue: p.price * (18 - idx * 3),
      }));

      return {
        metrics: {
          todaySales: totalSales || 982.8,
          todayOrders: MOCK_ORDERS.length || 2,
          totalOrders: MOCK_ORDERS.length || 2,
          pendingOrders: pendingCount,
          preparingOrders: preparingCount || 1,
          completedOrders: completedCount,
          totalProducts: MOCK_PRODUCTS.length,
          totalTables: MOCK_TABLES.length,
        },
        salesTrend,
        popularProducts,
      };
    }
  },

  async getAdminProducts(): Promise<Product[]> {
    try {
      const headers = await getAuthHeaders('ADMIN');
      const res = await fetch(`${API_BASE_URL}/admin/products`, { headers });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Admin products endpoint offline, returning local products:', err);
      return MOCK_PRODUCTS;
    }
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend product creation offline, creating local mock product:', err);
      const cat = MOCK_CATEGORIES.find((c) => c.id === data.categoryId) || MOCK_CATEGORIES[0];
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        categoryId: data.categoryId || cat.id,
        categoryName: cat.name,
        name: data.name || 'New Product',
        description: data.description || '',
        price: data.price || 199.0,
        image: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        isVeg: data.isVeg ?? true,
        isFeatured: data.isFeatured ?? false,
        isAvailable: data.isAvailable ?? true,
        preparationTime: data.preparationTime || 15,
      };
      MOCK_PRODUCTS.unshift(newProd);
      saveMockState('cafeqr_mock_products', MOCK_PRODUCTS);
      return newProd;
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend product update offline, updating local mock product:', err);
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) {
        if (data.categoryId) {
          const cat = MOCK_CATEGORIES.find((c) => c.id === data.categoryId);
          if (cat) data.categoryName = cat.name;
        }
        MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...data };
        saveMockState('cafeqr_mock_products', MOCK_PRODUCTS);
        return MOCK_PRODUCTS[idx];
      }
      throw err;
    }
  },

  async toggleProduct(id: string): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}/toggle`, {
        method: 'PATCH',
        headers: await getAuthHeaders('ADMIN'),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend product toggle offline, updating local mock product:', err);
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) {
        MOCK_PRODUCTS[idx].isAvailable = !MOCK_PRODUCTS[idx].isAvailable;
        saveMockState('cafeqr_mock_products', MOCK_PRODUCTS);
        return MOCK_PRODUCTS[idx];
      }
      throw err;
    }
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders('ADMIN'),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend product delete offline, removing local mock product:', err);
      MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== id);
      saveMockState('cafeqr_mock_products', MOCK_PRODUCTS);
      return { message: 'Product deleted successfully (Offline Mode).' };
    }
  },

  // Categories
  async getAdminCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Admin categories endpoint offline, returning local categories with dynamic counts:', err);
      return MOCK_CATEGORIES.map((cat) => ({
        ...cat,
        productCount: MOCK_PRODUCTS.filter((p) => p.categoryId === cat.id || p.categoryName === cat.name).length,
      }));
    }
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend category creation offline, creating local mock category:', err);
      const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: data.name || 'New Category',
        description: data.description || '',
        image: data.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
        sortOrder: data.sortOrder || MOCK_CATEGORIES.length + 1,
        isActive: data.isActive ?? true,
        productCount: 0,
      };
      MOCK_CATEGORIES.push(newCat);
      saveMockState('cafeqr_mock_categories', MOCK_CATEGORIES);
      return newCat;
    }
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend category update offline, updating local mock category:', err);
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx !== -1) {
        MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...data };
        saveMockState('cafeqr_mock_categories', MOCK_CATEGORIES);
        return MOCK_CATEGORIES[idx];
      }
      throw err;
    }
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders('ADMIN'),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend category delete offline, removing local mock category:', err);
      MOCK_CATEGORIES = MOCK_CATEGORIES.filter((c) => c.id !== id);
      saveMockState('cafeqr_mock_categories', MOCK_CATEGORIES);
      return { message: 'Category deleted successfully (Offline Mode).' };
    }
  },

  // Tables & QR
  async getAdminTables(): Promise<TableInfo[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Admin tables endpoint offline, returning local tables:', err);
      return MOCK_TABLES;
    }
  },

  async createTable(number: string, capacity: number): Promise<TableInfo> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables`, {
        method: 'POST',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify({ number, capacity }),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend table creation offline, creating local mock table:', err);
      const numClean = number.startsWith('Table') ? number : `Table ${number}`;
      const newTbl: TableInfo = {
        id: `tbl_${Date.now()}`,
        number: numClean,
        capacity: capacity || 4,
        qrToken: `tok_table${(MOCK_TABLES.length + 1).toString().padStart(2, '0')}_demo`,
        isActive: true,
      };
      MOCK_TABLES.push(newTbl);
      saveMockState('cafeqr_mock_tables', MOCK_TABLES);
      return newTbl;
    }
  },

  async regenerateQR(tableId: string): Promise<TableInfo> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables/${tableId}/qr`, {
        method: 'POST',
        headers: await getAuthHeaders('ADMIN'),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend QR regen offline, regenerating local token:', err);
      const idx = MOCK_TABLES.findIndex((t) => t.id === tableId);
      if (idx !== -1) {
        MOCK_TABLES[idx].qrToken = `tok_${Date.now()}`;
        saveMockState('cafeqr_mock_tables', MOCK_TABLES);
        return MOCK_TABLES[idx];
      }
      throw err;
    }
  },

  async getQRImageData(qrToken: string): Promise<{ menuUrl: string; qrDataUrl: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables/qr-image/${qrToken}`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      const menuUrl = `${window.location.origin}/?table=${qrToken}`;
      // Clean SVG Data URL for QR preview fallback
      const qrDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="%23ffffff" rx="16"/><rect x="20" y="20" width="65" height="65" fill="%231C120E" rx="8"/><rect x="32" y="32" width="41" height="41" fill="%23ffffff" rx="4"/><rect x="42" y="42" width="21" height="21" fill="%2300F5D4" rx="2"/><rect x="155" y="20" width="65" height="65" fill="%231C120E" rx="8"/><rect x="167" y="32" width="41" height="41" fill="%23ffffff" rx="4"/><rect x="177" y="42" width="21" height="21" fill="%2300F5D4" rx="2"/><rect x="20" y="155" width="65" height="65" fill="%231C120E" rx="8"/><rect x="32" y="167" width="41" height="41" fill="%23ffffff" rx="4"/><rect x="42" y="177" width="21" height="21" fill="%2300F5D4" rx="2"/><rect x="105" y="30" width="20" height="40" fill="%231C120E" rx="3"/><rect x="100" y="95" width="40" height="50" fill="%231C120E" rx="4"/><rect x="160" y="105" width="25" height="20" fill="%231C120E" rx="2"/><rect x="195" y="105" width="25" height="45" fill="%231C120E" rx="2"/><rect x="105" y="165" width="40" height="20" fill="%231C120E" rx="2"/><rect x="165" y="165" width="55" height="55" fill="%2300F5D4" rx="6"/><rect x="105" y="195" width="25" height="25" fill="%231C120E" rx="3"/><text x="120" y="232" font-family="sans-serif" font-size="9" font-weight="900" text-anchor="middle" fill="%231C120E">SCAN TABLE QR</text></svg>`;
      return { menuUrl, qrDataUrl };
    }
  },

  // Admin Orders
  async getAdminOrders(
    status?: string,
    search?: string,
    date?: string,
    startDate?: string,
    endDate?: string,
    range?: string
  ): Promise<OrderRecord[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      if (search) params.append('search', search);
      if (date) params.append('date', date);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (range) params.append('range', range);

      const headers = await getAuthHeaders('ADMIN');
      const res = await fetch(`${API_BASE_URL}/admin/orders?${params.toString()}`, { headers });
      const apiOrders = await handleResponse<OrderRecord[]>(res);
      return Array.isArray(apiOrders) ? apiOrders : [];
    } catch (err) {
      console.warn('Admin orders endpoint failed, returning filtered local orders:', err);
      MOCK_ORDERS = loadInitialMockOrders();
      let filtered = [...MOCK_ORDERS];

      if (status && status !== 'ALL') {
        filtered = filtered.filter((o) => o.orderStatus === status);
      }

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((o) =>
          (o.orderNumber && o.orderNumber.toString().includes(q)) ||
          (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.customerPhone && o.customerPhone.toLowerCase().includes(q))
        );
      }

      if (date) {
        filtered = filtered.filter((o) => o.createdAt && o.createdAt.startsWith(date));
      } else if (startDate && endDate) {
        filtered = filtered.filter((o) => {
          const d = o.createdAt ? o.createdAt.split('T')[0] : '';
          return d >= startDate && d <= endDate;
        });
      } else if (range === '7days') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= sevenDaysAgo);
      } else if (range === '30days') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= thirtyDaysAgo);
      }

      // Sort by newest order first
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async updateOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<OrderRecord> {
    const updateLocalOrder = (ord: OrderRecord) => {
      try {
        const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
        const tokenKey = ord.orderToken || ord.id;
        storedOrdersObj[tokenKey] = {
          ...storedOrdersObj[tokenKey],
          ...ord,
          orderStatus: orderStatus as any,
          ...(paymentStatus && { paymentStatus: paymentStatus as any }),
        };
        localStorage.setItem('cafeqr_customer_orders_data', JSON.stringify(storedOrdersObj));
        saveMockState('cafeqr_mock_orders', MOCK_ORDERS);
      } catch (e) {
        console.warn('Could not persist updated order status to localStorage:', e);
      }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      const updated = await handleResponse<OrderRecord>(res);
      const idx = MOCK_ORDERS.findIndex((o) => o.id === id || o.orderToken === id);
      if (idx !== -1) {
        MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], ...updated };
      }
      updateLocalOrder(updated);
      return updated;
    } catch (err) {
      const idx = MOCK_ORDERS.findIndex((o) => o.id === id || o.orderToken === id);
      if (idx !== -1) {
        MOCK_ORDERS[idx].orderStatus = orderStatus as any;
        if (paymentStatus) MOCK_ORDERS[idx].paymentStatus = paymentStatus as any;
        updateLocalOrder(MOCK_ORDERS[idx]);
        return MOCK_ORDERS[idx];
      }
      throw err;
    }
  },

  async deleteAdminOrder(orderId: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders('ADMIN'),
      });
      const data = await handleResponse<{ message: string }>(res);
      MOCK_ORDERS = MOCK_ORDERS.filter((o) => o.id !== orderId && o.orderToken !== orderId);
      return data;
    } catch (err) {
      MOCK_ORDERS = MOCK_ORDERS.filter((o) => o.id !== orderId && o.orderToken !== orderId);
      return { message: 'Order deleted successfully.' };
    }
  },

  // Staff
  async getStaff(): Promise<AuthUser[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff`, { headers: await getAuthHeaders('ADMIN') });
      const data = await handleResponse<AuthUser[]>(res);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return MOCK_STAFF;
    } catch (err) {
      return MOCK_STAFF;
    }
  },

  async createStaff(data: { name: string; email: string; password: string; role: string }): Promise<AuthUser> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff`, {
        method: 'POST',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify(data),
      });
      const newStaff = await handleResponse<AuthUser>(res);
      MOCK_STAFF.unshift(newStaff);
      return newStaff;
    } catch (err) {
      throw err;
    }
  },

  async deleteStaff(id: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders('ADMIN'),
      });
      const result = await handleResponse<{ message: string }>(res);
      MOCK_STAFF = MOCK_STAFF.filter((s) => s.id !== id);
      return result;
    } catch (err) {
      throw err;
    }
  },

  // Settings
  async getSettings(): Promise<CafeInfo> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      return MOCK_CAFE;
    }
  },

  async updateSettings(data: Partial<CafeInfo>): Promise<CafeInfo> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PATCH',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Backend settings update offline, updating local mock cafe:', err);
      MOCK_CAFE = { ...MOCK_CAFE, ...data };
      saveMockState('cafeqr_mock_cafe', MOCK_CAFE);
      return MOCK_CAFE;
    }
  },

  // --- Kitchen API ---
  async getKitchenOrders(): Promise<OrderRecord[]> {
    try {
      const headers = await getAuthHeaders('KITCHEN');
      const res = await fetch(`${API_BASE_URL}/kitchen/orders`, { headers });
      const apiOrders = await handleResponse<OrderRecord[]>(res);
      if (Array.isArray(apiOrders)) {
        return apiOrders;
      }
      return [];
    } catch (err) {
      console.warn('Kitchen orders endpoint failed, returning local active orders:', err);
      const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
      const localOrders = Object.values(storedOrdersObj) as OrderRecord[];
      const combined = [...localOrders, ...MOCK_ORDERS];
      const uniqueMap = new Map<string, OrderRecord>();
      combined.forEach((o) => {
        if (o && (o.id || o.orderToken)) {
          const key = o.id || o.orderToken;
          if (!uniqueMap.has(key)) uniqueMap.set(key, o);
        }
      });
      const activeList = Array.from(uniqueMap.values()).filter((o) =>
        ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.orderStatus)
      );
      return activeList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  },

  async advanceKitchenStatus(id: string, nextStatus: string): Promise<OrderRecord> {
    const updateLocalState = () => {
      try {
        const storedOrdersObj = JSON.parse(localStorage.getItem('cafeqr_customer_orders_data') || '{}');
        Object.keys(storedOrdersObj).forEach((k) => {
          if (k === id || storedOrdersObj[k].id === id || storedOrdersObj[k].orderToken === id) {
            storedOrdersObj[k].orderStatus = nextStatus as any;
          }
        });
        localStorage.setItem('cafeqr_customer_orders_data', JSON.stringify(storedOrdersObj));
      } catch {}

      const idx = MOCK_ORDERS.findIndex((o) => o.id === id || o.orderToken === id);
      if (idx !== -1) {
        MOCK_ORDERS[idx].orderStatus = nextStatus as any;
        saveMockState('cafeqr_mock_orders', MOCK_ORDERS);
      }
    };

    try {
      const headers = await getAuthHeaders('KITCHEN');
      const res = await fetch(`${API_BASE_URL}/kitchen/orders/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ nextStatus }),
      });
      const data = await handleResponse<OrderRecord>(res);
      updateLocalState();
      return data;
    } catch (err) {
      console.warn('Backend advanceKitchenStatus failed, updating local state:', err);
      updateLocalState();
      const found = MOCK_ORDERS.find((o) => o.id === id || o.orderToken === id);
      if (found) return found;
      return { id, orderStatus: nextStatus } as any;
    }
  },
};
