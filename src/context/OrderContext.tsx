
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem, Order } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface OrderContextType {
  cart: CartItem[];
  myOrders: Order[];
  kitchenOrders: Order[];
  loading: boolean;
  myOrdersLoading: boolean;
  error: string | null;
  activeOrderIdForUpdate: string | null;
  orderToUpdate: Order | null;
  setActiveOrderIdForUpdate: (orderId: string, order: Order) => void;
  clearActiveOrderId: () => void;
  clearOrderToUpdate: () => void;
  fetchMyOrders: (phone: string) => Promise<Order[] | undefined>;
  fetchKitchenOrders: () => Promise<void>;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setMyOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  completeOrder: (id: string) => Promise<boolean>;
  markAsPaid: (id: string) => Promise<boolean>;
  cartTotal: number;
  cartCount: number;
  inProgressOrderCount: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';
const ACTIVE_ORDER_ID_KEY = 'activeOrderIdForUpdate';
const ORDER_TO_UPDATE_KEY = 'orderToUpdate';


export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [activeOrderIdForUpdate, setActiveOrderIdForUpdateState] = useState<string | null>(null);
  const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null);
  const router = useRouter();


  useEffect(() => {
    try {
      const savedOrderId = localStorage.getItem(ACTIVE_ORDER_ID_KEY);
      if (savedOrderId) {
        setActiveOrderIdForUpdateState(savedOrderId);
        const savedOrder = localStorage.getItem(ORDER_TO_UPDATE_KEY);
        if (savedOrder) {
            setOrderToUpdate(JSON.parse(savedOrder));
        }
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
    }
  }, []);

  const fetchKitchenOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/today`);
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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/myorder?phone=${phone}`);
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
      const sortedOrders = fetchedOrders.sort((a, b) => b.timestamp - a.timestamp);
      setMyOrders(sortedOrders);
      return sortedOrders;
    } catch (err) {
      console.error('Error fetching my orders:', err);
      setMyOrders([]);
      return [];
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

  const setActiveOrderIdForUpdate = (orderId: string, order: Order) => {
    try {
      localStorage.setItem(ACTIVE_ORDER_ID_KEY, orderId);
      localStorage.setItem(ORDER_TO_UPDATE_KEY, JSON.stringify(order));
      setActiveOrderIdForUpdateState(orderId);
      setOrderToUpdate(order);
      clearCart();
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  };

  const clearActiveOrderId = () => {
    try {
      localStorage.removeItem(ACTIVE_ORDER_ID_KEY);
      setActiveOrderIdForUpdateState(null);
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  };

  const clearOrderToUpdate = () => {
    try {
      localStorage.removeItem(ORDER_TO_UPDATE_KEY);
      setOrderToUpdate(null);
    } catch (error) {
       console.error("Could not write to localStorage", error);
    }
  };


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
  const inProgressOrderCount = myOrders.filter(order => order.status === 'paid' || order.status === 'created').length;

  const markAsPaid = async (id: string): Promise<boolean> => {
     try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/status/${id}`,
        { status: 'paid' }
      );

      if (res.status === 200) {
        const update = (prevOrders: Order[]) => prevOrders.map(order =>
          order.id === id ? { ...order, status: 'paid' } : order
        );
        setKitchenOrders(update);
        setMyOrders(update);
        toast({ title: "Success", description: "Order marked as paid." });
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to mark order ${id} as paid:`, error);
      toast({ variant: 'destructive', title: "Error", description: "Could not mark order as paid." });
      return false;
    }
  };

  const completeOrder = async (id: string): Promise<boolean> => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/status/${id}`,
        { status: 'served' }
      );

      if (res.status === 200) {
        const update = (prevOrders: Order[]) => prevOrders.map(order =>
          order.id === id ? { ...order, status: 'served' } : order
        );
        setKitchenOrders(update);
        setMyOrders(update);
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to complete order ${id}:`, error);
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
        activeOrderIdForUpdate,
        orderToUpdate,
        setActiveOrderIdForUpdate,
        clearActiveOrderId,
        clearOrderToUpdate,
        setKitchenOrders,
        setMyOrders,
        fetchMyOrders,
        fetchKitchenOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeOrder,
        markAsPaid,
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
