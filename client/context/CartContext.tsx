import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: any;
}

interface CartContextData {
  cartItems: CartItem[];
  totalAmount: number;
  cartCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      setTotalAmount(0);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setCartItems(data.items);
      setTotalAmount(data.totalAmount);
    } catch (error) {
      console.log('Error fetching cart in context', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number) => {
    await api.addToCart(productId, quantity);
    await fetchCart();
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    await api.updateCartItem(productId, quantity);
    await fetchCart();
  };

  const removeFromCart = async (productId: string) => {
    await api.removeFromCart(productId);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.clearCart();
    await fetchCart();
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
