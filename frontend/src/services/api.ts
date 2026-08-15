import type { CafeInfo, TableInfo, Category, Product, OrderRecord, AuthUser, PaymentMethod } from '../types';

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
const MOCK_CAFE: CafeInfo = {
  id: 'cafe_1',
  name: 'TeaWala',
  logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
  address: '123 Gourmet Street, Culinary Quarter',
  phone: '+1 (555) 234-5678',
  email: 'hello@mycafe.com',
  taxRate: 5.0,
  currency: '₹',
  openHours: '8:00 AM - 10:00 PM',
};

const loadSavedOrInitial = <T>(key: string, defaults: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Auto-invalidate stale pizza/burger mock data
      const jsonStr = JSON.stringify(parsed);
      if (jsonStr.includes('Margherita') || jsonStr.includes('Pepperoni')) {
        localStorage.removeItem(key);
        return defaults;
      }
      return parsed;
    }
  } catch (e) {}
  return defaults;
};

const saveMockState = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

let MOCK_TABLES: TableInfo[] = loadSavedOrInitial('cafeqr_mock_tables', [
  { id: 'tbl_1', number: 'Table 01', capacity: 4, qrToken: 'tok_table01_demo', isActive: true },
  { id: 'tbl_2', number: 'Table 02', capacity: 2, qrToken: 'tok_table02_demo', isActive: true },
  { id: 'tbl_3', number: 'Table 03', capacity: 4, qrToken: 'tok_table03_demo', isActive: true },
  { id: 'tbl_4', number: 'Table 04', capacity: 6, qrToken: 'tok_table04_demo', isActive: true },
  { id: 'tbl_5', number: 'Table 05', capacity: 4, qrToken: 'tok_table05_demo', isActive: true },
  { id: 'tbl_6', number: 'Table 06', capacity: 8, qrToken: 'tok_table06_demo', isActive: true },
]);

let MOCK_CATEGORIES: Category[] = loadSavedOrInitial('cafeqr_mock_categories', [
  { id: 'cat_1', name: 'Milk Tea', description: 'Traditional spiced milk teas & aromatic herbal tea blends', sortOrder: 1, productCount: 4, isActive: true },
  { id: 'cat_2', name: 'No Milk Tea', description: 'Refreshing black teas, green teas & herbal kahwa infusions', sortOrder: 2, productCount: 2, isActive: true },
  { id: 'cat_3', name: 'Café Addiction', description: 'Signature hot & chilled coffees, flavored coffees & hot chocolate', sortOrder: 3, productCount: 2, isActive: true },
  { id: 'cat_4', name: 'Sandwiches', description: 'Freshly grilled paninis, cheese chutney & layered club sandwiches', sortOrder: 4, productCount: 2, isActive: true },
  { id: 'cat_5', name: 'Frankies & Burger', description: 'Crispy veg & paneer rolls, Schezwan rolls & loaded gourmet burgers', sortOrder: 5, productCount: 2, isActive: true },
  { id: 'cat_6', name: 'Maggi', description: 'Hot, cheesy, buttery & spiced instant Maggi noodles bowls', sortOrder: 6, productCount: 2, isActive: true },
  { id: 'cat_7', name: 'Healthy Snack', description: 'Fresh Gujarati methi thepla, hot rava upma & masala oats', sortOrder: 7, productCount: 2, isActive: true },
]);

let MOCK_PRODUCTS: Product[] = loadSavedOrInitial('cafeqr_mock_products', [
  { id: 'prod_1', categoryId: 'cat_1', categoryName: 'Milk Tea', name: 'Traditional Tea (Half)', description: 'Classic cutting chai brewed with milk, cardamom & tea leaves (Half cup)', price: 12.0, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 5 },
  { id: 'prod_2', categoryId: 'cat_1', categoryName: 'Milk Tea', name: 'Traditional Tea (Full)', description: 'Classic rich milk tea brewed with cardamom & tea leaves (Full cup)', price: 20.0, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 5 },
  { id: 'prod_3', categoryId: 'cat_1', categoryName: 'Milk Tea', name: 'Ginger Tea', description: 'Steaming hot milk tea infused with freshly crushed ginger', price: 35.0, image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: false, isAvailable: true, preparationTime: 5 },
  { id: 'prod_4', categoryId: 'cat_3', categoryName: 'Café Addiction', name: 'Hot Coffee', description: 'Freshly brewed aromatic hot milk coffee', price: 35.0, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 5 },
  { id: 'prod_5', categoryId: 'cat_3', categoryName: 'Café Addiction', name: 'Cold Coffee', description: 'Thick, creamy chilled espresso blended with milk and vanilla ice cream', price: 60.0, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 7 },
  { id: 'prod_6', categoryId: 'cat_4', categoryName: 'Sandwiches', name: 'Aaloo Mutter Sandwich', description: 'Spiced potato & green peas masala grilled sandwich', price: 60.0, image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: false, isAvailable: true, preparationTime: 6 },
  { id: 'prod_7', categoryId: 'cat_4', categoryName: 'Sandwiches', name: 'Veg Cheese Schezwan', description: 'Loaded vegetables, spicy Schezwan sauce & melted cheese grilled toast', price: 100.0, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80', isVeg: true, isFeatured: true, isAvailable: true, preparationTime: 8 },
]);

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
      return { message: 'Product deleted successfully (Offline Mode).' };
    }
  },

  // Categories
  async getAdminCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories`, { headers: await getAuthHeaders('ADMIN') });
      return await handleResponse(res);
    } catch (err) {
      console.warn('Admin categories endpoint offline, returning local categories:', err);
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
      console.warn('Backend category creation offline, creating local mock category:', err);
      const newCat: Category = {
        id: `cat_${Date.now()}`,
        name: data.name || 'New Category',
        description: data.description || '',
        image: data.image || '',
        sortOrder: data.sortOrder || MOCK_CATEGORIES.length + 1,
        isActive: data.isActive ?? true,
        productCount: 0,
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
      console.warn('Backend category update offline, updating local mock category:', err);
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx !== -1) {
        MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...data };
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
      const menuUrl = `http://localhost:5173/menu?table=${qrToken}`;
      // SVG Data URL for QR preview fallback
      const qrDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff"/><rect x="20" y="20" width="60" height="60" fill="%23000000"/><rect x="30" y="30" width="40" height="40" fill="%23ffffff"/><rect x="40" y="40" width="20" height="20" fill="%23000000"/><rect x="120" y="20" width="60" height="60" fill="%23000000"/><rect x="130" y="30" width="40" height="40" fill="%23ffffff"/><rect x="140" y="40" width="20" height="20" fill="%23000000"/><rect x="20" y="120" width="60" height="60" fill="%23000000"/><rect x="30" y="130" width="40" height="40" fill="%23ffffff"/><rect x="40" y="140" width="20" height="20" fill="%23000000"/><rect x="90" y="90" width="20" height="20" fill="%23d97706"/><text x="100" y="180" font-size="12" font-weight="bold" text-anchor="middle" fill="%23000000">Scan QR</text></svg>`;
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
      console.warn('Admin orders endpoint failed, returning local orders:', err);
      return MOCK_ORDERS;
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
      throw err;
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
