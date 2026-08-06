export interface CafeInfo {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxRate: number;
  currency: string;
  openHours?: string;
}
export const CafeInfo = {};

export interface TableInfo {
  id: string;
  number: string;
  capacity: number;
  qrToken: string;
  isActive?: boolean;
}
export const TableInfo = {};

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive?: boolean;
  productCount?: number;
}
export const Category = {};

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime?: number;
  isVeg: boolean;
}
export const Product = {};

export interface CartItem {
  product: Product;
  quantity: number;
  specialNote?: string;
}
export const CartItem = {};

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export const OrderStatus = {};

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export const PaymentStatus = {};

export type PaymentMethod = 'CASH' | 'PAY_AT_COUNTER' | 'ONLINE';
export const PaymentMethod = {};

export interface OrderItemRecord {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  specialNote?: string;
}
export const OrderItemRecord = {};

export interface OrderRecord {
  id: string;
  orderNumber: number;
  orderToken: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cafeName?: string;
  notes?: string;
  createdAt: string;
  elapsedMinutes?: number;
  items: OrderItemRecord[];
}
export const OrderRecord = {};

export interface AuthUser {
  id: string;
  staffId?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'KITCHEN';
  cafeId: string;
  cafeName: string;
  currency: string;
  createdAt?: string;
}
export const AuthUser = {};
