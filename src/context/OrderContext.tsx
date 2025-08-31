
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem, Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { completeOrder as completeOrderInDB } from '@/ai/flows/order-flow';
import axios from 'axios';

interface OrderContextType {
  cart: CartItem[];
  myOrderTokens: string[];
  kitchenOrders: Order[];
  loading: boolean;
  error: string | null;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addMyOrderToken: (token: string) => void;
  completeOrder: (id: string) => Promise<boolean>; 
  cartTotal: number;
  cartCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const MY_ORDERS_KEY = 'myOrderTokens';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrderTokens, setMyOrderTokens] = useState<string[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchenOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/today`
      );
      const backendOrders = res.data.orders || [];

      const fetchedOrders: Order[] = backendOrders.map((order: any) => ({
        id: order._id, // Capture the main document ID
        token: order.orderToken,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        total: order.amount,
        status: order.status,
        timestamp: new Date(order.createdAt).getTime(),
        items: order.lineItems.map((item: any) => ({
          id: item._id,
          name: item.sku,
          quantity: item.qty,
          price: item.price,
        })),
      }));

      setKitchenOrders(fetchedOrders.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setError('Could not fetch kitchen orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    try {
      const storedTokens = localStorage.getItem(MY_ORDERS_KEY);
      if (storedTokens) {
        setMyOrderTokens(JSON.parse(storedTokens));
      }
    } catch (error) {
        console.error("Could not read from localStorage", error)
    }

    fetchKitchenOrders();

  }, [fetchKitchenOrders]);

  const addMyOrderToken = useCallback((token: string) => {
    setMyOrderTokens((prevTokens) => {
      if (prevTokens.includes(token)) {
        return prevTokens;
      }
      const newTokens = [...prevTokens, token];
      try {
        localStorage.setItem(MY_ORDERS_KEY, JSON.stringify(newTokens));
      } catch (error) {
        console.error("Could not write to localStorage", error);
      }
      return newTokens;
    });
  }, []);


  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const completeOrder = async (id: string): Promise<boolean> => {
    try {
        const result = await completeOrderInDB(id);
        if (result.success) {
          toast({
              title: "Order Completed!",
              description: `Order has been marked as complete.`
          });
          return true;
        } else {
           throw new Error("Backend update failed");
        }
    } catch (error) {
        console.error(`Failed to complete order ${id}:`, error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not complete the order. Please try again."
        })
        return false;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        cart,
        myOrderTokens,
        kitchenOrders,
        loading,
        error,
        setKitchenOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addMyOrderToken,
        completeOrder,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
