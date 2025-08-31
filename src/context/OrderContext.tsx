
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem, Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

interface OrderContextType {
  cart: CartItem[];
  myOrders: Order[];
  kitchenOrders: Order[];
  loading: boolean; // For kitchen orders
  myOrdersLoading: boolean; // For my orders
  error: string | null;
  fetchMyOrders: (phone: string) => Promise<void>;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  completeOrder: (id: string) => Promise<boolean>; 
  cartTotal: number;
  cartCount: number;
  inProgressOrderCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);


  const fetchKitchenOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/today`
      );
      const backendOrders = res.data.orders || [];

      const fetchedOrders: Order[] = backendOrders.map((order: any) => ({
        id: order._id,
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
  
  const fetchMyOrders = useCallback(async (phone: string) => {
    if (!phone || phone.length !== 10) return;
    setMyOrdersLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/myorder?phone=${phone}`
      );
      const backendOrders = res.data.orders || [];
      const fetchedOrders: Order[] = backendOrders.map((order: any) => ({
        token: order.orderToken,
        id: order._id,
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
      setMyOrders(fetchedOrders.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching my orders:', err);
      // We don't set a general error here not to disrupt other parts of the UI
    } finally {
      setMyOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKitchenOrders();
    const cachedPhone = localStorage.getItem(CUSTOMER_PHONE_KEY);
    if (cachedPhone) {
        fetchMyOrders(cachedPhone);
    }
  }, [fetchKitchenOrders, fetchMyOrders]);


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
  const inProgressOrderCount = myOrders.filter(order => order.status !== 'done').length;

  const completeOrder = async (id: string): Promise<boolean> => {
    try {
        const res = await axios.patch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/status/${id}`, 
            { status: 'done' }
        );

        if (res.status === 200) {
          setKitchenOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === id ? { ...order, status: 'done' } : order
            ).sort((a, b) => b.timestamp - a.timestamp)
          );
          // Also refresh myOrders if the completed order is in that list
          setMyOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === id ? { ...order, status: 'done' } : order
            )
          );
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
        myOrders,
        kitchenOrders,
        loading,
        myOrdersLoading,
        error,
        setKitchenOrders,
        fetchMyOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeOrder,
        cartTotal,
        cartCount,
        inProgressOrderCount,
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
