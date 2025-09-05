
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { CartItem, MenuItem, Order, OrderItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface OrderContextType {
  cart: CartItem[];
  myOrders: Order[];
  kitchenOrders: Order[];
  loading: boolean; // For kitchen orders
  myOrdersLoading: boolean; // For my orders
  error: string | null;
  fetchMyOrders: (phone: string) => Promise<void>;
  fetchKitchenOrders: () => Promise<void>;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  markAsPaid: (id: string) => Promise<boolean>;
  completeOrder: (id: string) => Promise<boolean>;
  cancelOrder: (id: string) => Promise<boolean>;
  updateOrderItems: (orderId: string, customer: { name: string, phone: string }, items: { sku: string, qty: number, price: number }[]) => Promise<boolean>;
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
  const {toast} = useToast();


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
        customerName: order.customer?.name || '',
        customerPhone: order.customer?.phone || '',
        total: order.amount,
        amountDue: order.amountDue,
        status: order.status === 'created' ? 'new' : order.status,
        timestamp: new Date(order.createdAt).getTime(),
        items: order.lineItems.map((item: any) => ({
          id: item._id,
          name: item.sku,
          quantity: item.qty,
          price: item.price,
        })),
        served: order.served || false,
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
        customerName: order.customer?.name || '',
        customerPhone: order.customer?.phone || '',
        total: order.amount,
        amountDue: order.amountDue,
        status: order.status === 'created' ? 'new' : order.status,
        timestamp: new Date(order.createdAt).getTime(),
        items: order.lineItems.map((item: any) => ({
          id: item._id,
          name: item.sku,
          quantity: item.qty,
          price: item.price,
        })),
        served: order.served || false,
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
  const inProgressOrderCount = myOrders.filter(order => order.status !== 'done' && order.status !== 'served').length;

 const completeOrder = async (id: string): Promise<boolean> => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/status/${id}`,
        { status: 'served' }
      );

      if (res.status === 200) {
        const updateOrderState = (prevOrders: Order[]) =>
          prevOrders.map((order) => {
            if (order.id === id) {
              const updatedOrder = { ...order, served: true };
              // If also paid, mark as done
              if (updatedOrder.status === 'paid') {
                updatedOrder.status = 'done';
              }
              return updatedOrder;
            }
            return order;
          }).sort((a, b) => b.timestamp - a.timestamp);

        setKitchenOrders(updateOrderState);
        setMyOrders(updateOrderState);
        
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to complete order ${id}:`, error);
      return false;
    }
  };

  const markAsPaid = async (id: string): Promise<boolean> => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kitchen/status/${id}`,
        { status: 'paid' }
      );

      if (res.status === 200) {
        const updateOrderState = (prevOrders: Order[]) =>
          prevOrders.map((order) => {
            if (order.id === id) {
               const updatedOrder = { ...order, status: 'paid' as const };
               // If also served, mark as done
               if (updatedOrder.served) {
                  updatedOrder.status = 'done';
               }
               return updatedOrder;
            }
            return order;
          }).sort((a,b) => b.timestamp - a.timestamp);

        setKitchenOrders(updateOrderState);
        setMyOrders(updateOrderState);
        
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to mark order ${id} as paid:`, error);
      return false;
    }
  };
  
  const updateOrderItems = async (orderId: string, customer: { name: string, phone: string }, items: { sku: string, qty: number, price: number }[]): Promise<boolean> => {
    try {
      const payload = {
        items,
        customer,
      };
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`,
        payload
      );

      if (res.status === 200 && res.data.order) {
        // We can just refetch all orders to get the latest state
        await fetchKitchenOrders();
        return true;
      } else {
        throw new Error('Failed to update order. Invalid response from server.');
      }
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while updating the order.',
      });
      return false;
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`
      );

      if (res.status === 200) {
        const filterOutOrder = (prevOrders: Order[]) => 
          prevOrders.filter((order) => order.id !== orderId);

        setKitchenOrders(filterOutOrder);
        setMyOrders(filterOutOrder);
        
        return true;
      } else {
        throw new Error('Backend returned an error');
      }
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while cancelling the order.',
      });
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
        fetchKitchenOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeOrder,
        markAsPaid,
        cancelOrder,
        updateOrderItems,
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
