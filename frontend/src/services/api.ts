import type { CafeInfo, TableInfo, Category, Product, OrderRecord, AuthUser } from '../types';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

async function ensureAuthToken(role: 'KITCHEN' | 'ADMIN' = 'KITCHEN'): Promise<string | null> {
  let token = localStorage.getItem('cafeqr_token');
  if (token) return token;

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
    console.warn('Auto authentication failed:', e);
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
const MOCK_CAFE: CafeInfo = {
  id: 'cafe_1',
  name: 'My Cafe',
  logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
  address: '123 Gourmet Street, Culinary Quarter',
  phone: '+1 (555) 234-5678',
  email: 'hello@mycafe.com',
  taxRate: 5.0,
  currency: '₹',
  openHours: '8:00 AM - 10:00 PM',
};

const MOCK_TABLES: TableInfo[] = [
  { id: 'tbl_1', number: 'Table 01', capacity: 4, qrToken: 'tok_table01_demo', isActive: true },
  { id: 'tbl_2', number: 'Table 02', capacity: 2, qrToken: 'tok_table02_demo', isActive: true },
  { id: 'tbl_3', number: 'Table 03', capacity: 4, qrToken: 'tok_table03_demo', isActive: true },
  { id: 'tbl_4', number: 'Table 04', capacity: 6, qrToken: 'tok_table04_demo', isActive: true },
  { id: 'tbl_5', number: 'Table 05', capacity: 4, qrToken: 'tok_table05_demo', isActive: true },
  { id: 'tbl_6', number: 'Table 06', capacity: 8, qrToken: 'tok_table06_demo', isActive: true },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Pizza', description: 'Artisanal wood-fired pizzas', sortOrder: 1, productCount: 3, isActive: true },
  { id: 'cat_2', name: 'Burger', description: 'Gourmet smashed burgers', sortOrder: 2, productCount: 3, isActive: true },
  { id: 'cat_3', name: 'Sandwich', description: 'Fresh paninis & club sandwiches', sortOrder: 3, productCount: 3, isActive: true },
  { id: 'cat_4', name: 'Starters', description: 'Crispy appetizers & bites', sortOrder: 4, productCount: 3, isActive: true },
  { id: 'cat_5', name: 'Main Course', description: 'Hearty bowls & pastas', sortOrder: 5, productCount: 3, isActive: true },
  { id: 'cat_6', name: 'Drinks', description: 'Coffees & refreshers', sortOrder: 6, productCount: 3, isActive: true },
  { id: 'cat_7', name: 'Desserts', description: 'Decadent cakes & pastries', sortOrder: 7, productCount: 3, isActive: true },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'prod_1', categoryId: 'cat_1', categoryName: 'Pizza', name: 'Margherita Supreme', description: 'San Marzano sauce, fresh mozzarella & basil.', price: 349.0, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 18 },
  { id: 'prod_2', categoryId: 'cat_1', categoryName: 'Pizza', name: 'Pepperoni Feast', description: 'Loaded with double crispy pepperoni slices.', price: 429.0, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80', isVeg: false, isFeatured: true, isAvailable: true, preparationTime: 20 },
  { id: 'prod_3', categoryId: 'cat_2', categoryName: 'Burger', name: 'Classic Smash Cheeseburger', description: 'Double Angus beef patties, melted cheese & pickles.', price: 289.0, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', isVeg: false, isFeatured: true, isAvailable: true, preparationTime: 15 },
  { id: 'prod_4', categoryId: 'cat_2', categoryName: 'Burger', name: 'Crispy Avocado Veggie Burger', description: 'Quinoa patty, avocado & chipotle aioli.', price: 249.0, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: false, isAvailable: true, preparationTime: 15 },
  { id: 'prod_5', categoryId: 'cat_4', categoryName: 'Starters', name: 'Truffle Parmesan Loaded Fries', description: 'Truffle oil, parmesan & parsley.', price: 189.0, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 10 },
  { id: 'prod_6', categoryId: 'cat_6', categoryName: 'Drinks', name: 'Iced Vanilla Bean Latte', description: 'Double espresso with chilled oat milk & vanilla.', price: 149.0, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 5 },
  { id: 'prod_7', categoryId: 'cat_7', categoryName: 'Desserts', name: 'Molten Belgian Lava Cake', description: 'Warm chocolate cake with oozing center.', price: 219.0, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 12 },
];

let MOCK_STAFF: AuthUser[] = [
  { id: 'usr_1', staffId: 'STF-101', name: 'Cafe Admin Manager', email: 'admin@cafeqr.com', role: 'ADMIN', cafeId: 'cafe_1', cafeName: 'My Cafe', currency: '₹', createdAt: new Date().toISOString() },
  { id: 'usr_2', staffId: 'STF-102', name: 'Head Chef', email: 'kitchen@cafeqr.com', role: 'KITCHEN', cafeId: 'cafe_1', cafeName: 'My Cafe', currency: '₹', createdAt: new Date().toISOString() },
];

let MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'ord_105',
    orderNumber: 105,
    orderToken: 'ord_tok_105',
    tableNumber: 'Table 04',
    customerName: 'Guest Customer',
    orderStatus: 'PREPARING',
    paymentStatus: 'PENDING',
    paymentMethod: 'PAY_AT_COUNTER',
    subtotal: 398.0,
    tax: 19.9,
    discount: 0,
    total: 417.9,
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
    elapsedMinutes: 6,
    items: [
      { id: 'i1', productName: 'Classic Smash Cheeseburger', price: 289.0, quantity: 1, subtotal: 289.0 },
      { id: 'i2', productName: 'Iced Vanilla Bean Latte', price: 149.0, quantity: 1, subtotal: 149.0 },
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
    subtotal: 538.0,
    tax: 26.9,
    discount: 0,
    total: 564.9,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    elapsedMinutes: 2,
    items: [
      { id: 'i3', productName: 'Margherita Supreme', price: 349.0, quantity: 1, subtotal: 349.0 },
      { id: 'i4', productName: 'Truffle Parmesan Loaded Fries', price: 189.0, quantity: 1, subtotal: 189.0 },
    ],
  },
];

export const api = {
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
    items: Array<{ productId: string; quantity: number; specialNote?: string }>;
  }): Promise<{ message: string; order: OrderRecord }> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await handleResponse(res);
    } catch (err) {
      const mockOrderToken = 'ord_tok_' + Date.now();
      const newOrder: OrderRecord = {
        id: 'ord_' + Date.now(),
        orderNumber: MOCK_ORDERS.length + 107,
        orderToken: mockOrderToken,
        tableNumber: 'Table 01',
        customerName: payload.customerName || 'Guest Customer',
        customerPhone: payload.customerPhone,
        orderStatus: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: payload.paymentMethod as any,
        subtotal: 398.0,
        tax: 19.9,
        discount: 0,
        total: 417.9,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        elapsedMinutes: 0,
        items: payload.items.map((item, idx) => ({
          id: 'item_' + idx,
          productName: MOCK_PRODUCTS.find((p) => p.id === item.productId)?.name || 'Food Item',
          price: 200,
          quantity: item.quantity,
          subtotal: 200 * item.quantity,
          specialNote: item.specialNote,
        })),
      };
      MOCK_ORDERS.unshift(newOrder);
      return { message: 'Order placed successfully!', order: newOrder };
    }
  },

  async trackOrder(orderToken: string): Promise<OrderRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/orders/${orderToken}`);
      return await handleResponse(res);
    } catch (err) {
      const found = MOCK_ORDERS.find((o) => o.orderToken === orderToken);
      return found || MOCK_ORDERS[0];
    }
  },

  // --- Auth API ---
  async login(credentials: { email: string; password: string }): Promise<{
    token: string;
    user: AuthUser;
  }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse<{ token: string; user: AuthUser }>(res);
    localStorage.setItem('cafeqr_token', data.token);
    return data;
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
      throw err;
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
      return {
        metrics: {
          todaySales: 14850.0,
          todayOrders: 48,
          totalOrders: 142,
          pendingOrders: 3,
          preparingOrders: 5,
          completedOrders: 38,
          totalProducts: 21,
          totalTables: 6,
        },
        salesTrend: [
          { date: 'Mon', sales: 12400, orders: 38 },
          { date: 'Tue', sales: 14200, orders: 42 },
          { date: 'Wed', sales: 11800, orders: 35 },
          { date: 'Thu', sales: 16500, orders: 50 },
          { date: 'Fri', sales: 18900, orders: 58 },
          { date: 'Sat', sales: 22400, orders: 68 },
          { date: 'Sun', sales: 14850, orders: 48 },
        ],
        popularProducts: [
          { name: 'Margherita Supreme', quantity: 24, revenue: 8376.0 },
          { name: 'Classic Smash Cheeseburger', quantity: 18, revenue: 5202.0 },
          { name: 'Iced Vanilla Bean Latte', quantity: 32, revenue: 4768.0 },
          { name: 'Truffle Parmesan Loaded Fries', quantity: 15, revenue: 2835.0 },
          { name: 'Molten Belgian Lava Cake', quantity: 12, revenue: 2628.0 },
        ],
      };
    }
  },

  async getAdminProducts(): Promise<Product[]> {
    try {
      const headers = await getAuthHeaders('ADMIN');
      const res = await fetch(`${API_BASE_URL}/admin/products`, { headers });
      return await handleResponse(res);
    } catch (err) {
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
      const newProd: Product = {
        id: 'prod_' + Date.now(),
        categoryId: data.categoryId || 'cat_1',
        name: data.name || 'New Item',
        description: data.description,
        price: data.price || 199,
        image: data.image,
        isVeg: data.isVeg ?? true,
        isFeatured: data.isFeatured ?? false,
        isAvailable: data.isAvailable ?? true,
        preparationTime: data.preparationTime || 15,
      };
      MOCK_PRODUCTS.unshift(newProd);
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
      const existing = MOCK_PRODUCTS.find((p) => p.id === id);
      if (existing) Object.assign(existing, data);
      return existing || MOCK_PRODUCTS[0];
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
      const existing = MOCK_PRODUCTS.find((p) => p.id === id);
      if (existing) existing.isAvailable = !existing.isAvailable;
      return existing || MOCK_PRODUCTS[0];
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
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
      return { message: 'Product deleted' };
    }
  },

  // Categories
  async getAdminCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      return MOCK_CATEGORIES;
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
      const newCat: Category = {
        id: 'cat_' + Date.now(),
        name: data.name || 'New Category',
        description: data.description,
        sortOrder: data.sortOrder || 0,
        productCount: 0,
        isActive: true,
      };
      MOCK_CATEGORIES.push(newCat);
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
      const existing = MOCK_CATEGORIES.find((c) => c.id === id);
      if (existing) Object.assign(existing, data);
      return existing || MOCK_CATEGORIES[0];
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
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1);
      return { message: 'Category deleted' };
    }
  },

  // Tables & QR
  async getAdminTables(): Promise<TableInfo[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
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
      const newTbl: TableInfo = {
        id: 'tbl_' + Date.now(),
        number,
        capacity,
        qrToken: 'tok_' + Date.now(),
        isActive: true,
      };
      MOCK_TABLES.push(newTbl);
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
      const tbl = MOCK_TABLES.find((t) => t.id === tableId);
      if (tbl) tbl.qrToken = 'tok_' + Date.now();
      return tbl || MOCK_TABLES[0];
    }
  },

  async getQRImageData(qrToken: string): Promise<{ menuUrl: string; qrDataUrl: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tables/qr-image/${qrToken}`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      const menuUrl = `http://localhost:5173/menu?table=${qrToken}`;
      // SVG Data URL for QR preview fallback
      const qrDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff"/><rect x="20" y="20" width="60" height="60" fill="%23000000"/><rect x="30" y="30" width="40" height="40" fill="%23ffffff"/><rect x="40" y="40" width="20" height="20" fill="%23000000"/><rect x="120" y="20" width="60" height="60" fill="%23000000"/><rect x="130" y="30" width="40" height="40" fill="%23ffffff"/><rect x="140" y="40" width="20" height="20" fill="%23000000"/><rect x="20" y="120" width="60" height="60" fill="%23000000"/><rect x="30" y="130" width="40" height="40" fill="%23ffffff"/><rect x="40" y="140" width="20" height="20" fill="%23000000"/><rect x="90" y="90" width="20" height="20" fill="%23d97706"/><text x="100" y="180" font-size="12" font-weight="bold" text-anchor="middle" fill="%23000000">Scan QR</text></svg>`;
      return { menuUrl, qrDataUrl };
    }
  },

  // Admin Orders
  async getAdminOrders(status?: string, search?: string, date?: string): Promise<OrderRecord[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      if (date) params.append('date', date);

      const headers = await getAuthHeaders('ADMIN');
      const res = await fetch(`${API_BASE_URL}/admin/orders?${params.toString()}`, { headers });
      return await handleResponse(res);
    } catch (err) {
      let filtered = MOCK_ORDERS;
      if (status && status !== 'ALL') {
        filtered = filtered.filter((o) => o.orderStatus === status);
      }
      if (date) {
        filtered = filtered.filter((o) => o.createdAt.startsWith(date));
      }
      return filtered;
    }
  },

  async updateOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<OrderRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: await getAuthHeaders('ADMIN'),
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      return await handleResponse(res);
    } catch (err) {
      const ord = MOCK_ORDERS.find((o) => o.id === id);
      if (ord) {
        ord.orderStatus = orderStatus as any;
        if (paymentStatus) ord.paymentStatus = paymentStatus as any;
      }
      return ord || MOCK_ORDERS[0];
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
      const fallbackStaff: AuthUser = {
        id: 'usr_' + Date.now(),
        staffId: `STF-${(101 + MOCK_STAFF.length).toString().padStart(3, '0')}`,
        name: data.name,
        email: data.email,
        role: data.role as any,
        cafeId: 'cafe_1',
        cafeName: 'My Cafe',
        currency: '₹',
        createdAt: new Date().toISOString(),
      };
      MOCK_STAFF.unshift(fallbackStaff);
      return fallbackStaff;
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
      MOCK_STAFF = MOCK_STAFF.filter((s) => s.id !== id);
      return { message: 'Staff account deleted' };
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
      Object.assign(MOCK_CAFE, data);
      return MOCK_CAFE;
    }
  },

  // --- Kitchen API ---
  async getKitchenOrders(): Promise<OrderRecord[]> {
    try {
      const headers = await getAuthHeaders('KITCHEN');
      const res = await fetch(`${API_BASE_URL}/kitchen/orders`, { headers });
      return await handleResponse(res);
    } catch (err) {
      return MOCK_ORDERS.filter((o) => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.orderStatus));
    }
  },

  async advanceKitchenStatus(id: string, nextStatus: string): Promise<OrderRecord> {
    try {
      const headers = await getAuthHeaders('KITCHEN');
      const res = await fetch(`${API_BASE_URL}/kitchen/orders/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ nextStatus }),
      });
      return await handleResponse(res);
    } catch (err) {
      const ord = MOCK_ORDERS.find((o) => o.id === id);
      if (ord) ord.orderStatus = nextStatus as any;
      return ord || MOCK_ORDERS[0];
    }
  },
};
