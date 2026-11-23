// Shoe types
export interface ShoeSize {
  id: number;
  size: number;
  quantity: number;
}

export interface ShoeColor {
  id: number;
  colorName: string;
  colorCode: string;
  imageUrl: string;
}

export interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  sizes: ShoeSize[];
  colors: ShoeColor[];
}

// Cart types
export interface CartItem {
  shoe: Shoe;
  colorId: number;
  colorName: string;
  size: number;
  quantity: number;
}

// Backend Cart types
export interface BackendCartItem {
  id: number;
  shoeId: number;
  shoeName: string;
  colorId: number;
  colorName: string;
  imageUrl: string;
  size: number;
  price: number;
  quantity: number;
}

export interface BackendCart {
  id: number;
  items: BackendCartItem[];
  total: number;
}

// Order types
export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  shoeId: number;
  shoeName: string;
  colorId: number;
  colorName: string;
  imageUrl: string;
  size: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

// User types
export interface User {
  id: string;
  email: string;
  role: 'Client' | 'Admin';
}

// Auth types
export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Filter types
export interface ProductFilters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
