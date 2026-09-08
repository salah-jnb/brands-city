import { Shoe, ShoeColor, Order, AuthResponse, ApiResponse, User, OrderStatus, BackendCart } from '@/types';

const API_BASE_URL = 'http://localhost:5150/api';
const STATIC_URL = 'http://localhost:5150';

// Helper to build full image URL
export const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/placeholder.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STATIC_URL}${imageUrl}`;
};

// Helper to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper for authenticated requests
const authHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...options.headers,
      },
    });

    // Handle 204 No Content responses
    if (response.status === 204) {
      return { data: undefined as T };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return { error: data?.message || 'Une erreur est survenue' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Erreur de connexion au serveur' };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => fetchApi<User>('/auth/profile'),
};

// Cart API
export const cartApi = {
  getCart: () => fetchApi<BackendCart>('/cart'),

  addItem: (shoeId: number, colorId: number, size: number, quantity: number) =>
    fetchApi<BackendCart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ shoeId, colorId, size, quantity }),
    }),

  removeItem: (shoeId: number) =>
    fetchApi<BackendCart>(`/cart/items/${shoeId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    fetchApi<void>('/cart', {
      method: 'DELETE',
    }),
};

// Shoes API
export const shoesApi = {
  getAll: (params?: { brand?: string; minPrice?: number; maxPrice?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.brand) searchParams.append('brand', params.brand);
    if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const query = searchParams.toString();
    return fetchApi<Shoe[]>(`/shoes${query ? `?${query}` : ''}`);
  },

  getBrands: () => fetchApi<string[]>('/shoes/brands'),

  uploadImage: async (file: File, colorName?: string): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);
    if (colorName) {
      formData.append('colorName', colorName);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/shoes/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: error.message || 'Upload failed' };
      }
      const data = await response.json();
      return { data, error: null };
    } catch {
      return { data: null, error: 'Network error' };
    }
  },

  getById: (id: string) => fetchApi<Shoe>(`/shoes/${id}`),

  create: (data: {
    name: string;
    brand: string;
    price: number;
    sizes: { size: number; quantity: number }[];
  }) =>
    fetchApi<Shoe>('/shoes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, shoe: Partial<Shoe>) =>
    fetchApi<Shoe>(`/shoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shoe),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/shoes/${id}`, {
      method: 'DELETE',
    }),

  addColor: (shoeId: number, data: { colorName: string; colorCode: string; imageUrl: string }) =>
    fetchApi<ShoeColor>(`/shoes/${shoeId}/colors`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteColor: (shoeId: number, colorId: number) =>
    fetchApi<void>(`/shoes/${shoeId}/colors/${colorId}`, {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersApi = {
  getMyOrders: () => fetchApi<Order[]>('/orders'),

  getAll: () => fetchApi<Order[]>('/orders/all'),

  getById: (id: string) => fetchApi<Order>(`/orders/${id}`),

  // Backend creates order from server-side cart
  create: () =>
    fetchApi<Order>('/orders', {
      method: 'POST',
    }),

  updateStatus: (id: string, status: OrderStatus) =>
    fetchApi<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Stats API (Admin)
export const statsApi = {
  getDashboard: () =>
    fetchApi<{
      totalOrders: number;
      totalRevenue: number;
      totalProducts: number;
      totalUsers: number;
      recentOrders: Order[];
    }>('/stats/dashboard'),
};
