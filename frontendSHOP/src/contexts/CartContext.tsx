import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Shoe, ShoeColor } from '@/types';
import { cartApi } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (shoe: Shoe, colorId: number, size: number, quantity?: number) => void;
  removeItem: (shoeId: number, colorId: number, size: number) => void;
  updateQuantity: (shoeId: number, colorId: number, size: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (shoeId: number, colorId: number, size: number) => number;
  syncCartToServer: () => Promise<void>;
  isAdmin: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'brandscity_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  // Load cart from localStorage on mount (only for non-admin users)
  useEffect(() => {
    if (isAdmin) {
      setItems([]);
      return;
    }
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, [isAdmin]);

  // Save cart to localStorage (only for non-admin users)
  useEffect(() => {
    if (!isAdmin) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAdmin]);

  // Sync local cart to server when user logs in
  const syncCartToServer = useCallback(async () => {
    if (!user || isAdmin || items.length === 0) return;

    // Le panier local fait foi : on vide le panier serveur puis on le recopie
    // (évite de doubler les quantités déjà ajoutées au serveur)
    await cartApi.clearCart();
    for (const item of items) {
      await cartApi.addItem(item.shoe.id, item.colorId, item.size, item.quantity);
    }
  }, [user, items, isAdmin]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.shoe.price * item.quantity, 0);

  const addItem = useCallback(async (shoe: Shoe, colorId: number, size: number, quantity = 1) => {
    // Admin cannot add to cart
    if (isAdmin) {
      toast.error("Les administrateurs ne peuvent pas commander");
      return;
    }

    const color = shoe.colors.find(c => c.id === colorId);
    const colorName = color?.colorName || 'Default';

    // Always update local state first
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.shoe.id === shoe.id && item.colorId === colorId && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { shoe, colorId, colorName, size, quantity }];
    });

    // If user is logged in, also sync to server
    if (user) {
      const response = await cartApi.addItem(shoe.id, colorId, size, quantity);
      if (response.error) {
        toast.error(response.error);
        return;
      }
    }

    toast.success('Article ajouté au panier');
  }, [user, isAdmin]);

  const removeItem = useCallback(async (shoeId: number, colorId: number, size: number) => {
    setItems((prev) =>
      prev.filter((item) => !(item.shoe.id === shoeId && item.colorId === colorId && item.size === size))
    );

    if (user) {
      await cartApi.removeItem(shoeId, colorId, size);
    }

    toast.success('Article retiré du panier');
  }, [user]);

  const updateQuantity = useCallback((shoeId: number, colorId: number, size: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(shoeId, colorId, size);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.shoe.id === shoeId && item.colorId === colorId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    if (user) {
      await cartApi.clearCart();
    }

    toast.success('Panier vidé');
  }, [user]);

  const getItemQuantity = useCallback((shoeId: number, colorId: number, size: number) => {
    const item = items.find((i) => i.shoe.id === shoeId && i.colorId === colorId && i.size === size);
    return item?.quantity || 0;
  }, [items]);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    syncCartToServer,
    isAdmin,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
