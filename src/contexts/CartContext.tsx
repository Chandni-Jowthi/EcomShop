import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { CartItem, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart items when user changes
  useEffect(() => {
    if (user) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart items:', error);
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      throw new Error('Must be logged in to add items to cart');
    }

    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.product_id === productId);
    
    if (existingItem) {
      await updateCartItem(existingItem.id, existingItem.quantity + quantity);
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert([
          {
            user_id: user.id,
            product_id: productId,
            quantity,
          }
        ]);

      if (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }
      
      await loadCartItems();
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
    
    await loadCartItems();
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
    
    await loadCartItems();
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
    
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.products?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}