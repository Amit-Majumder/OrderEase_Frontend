
'use client';

import { OrderCard } from '@/components/OrderCard';
import { ChefHat, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, useCallback } from 'react';
import type { Order } from '@/lib/types';
import axios from 'axios';
import { useOrder } from '@/context/OrderContext';

export default function KitchenPage() {
  const { kitchenOrders, setKitchenOrders, loading, error } = useOrder();

  const handleOrderCompletion = (orderId: string) => {
    const updatedOrders = kitchenOrders.map(order => 
      order.id === orderId ? { ...order, status: 'completed' } : order
    );
    setKitchenOrders(updatedOrders);
  };
  
  const newOrders = kitchenOrders.filter((order) => order.status === 'paid');
  const completedOrders = kitchenOrders.filter((order) => order.status === 'completed');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading Kitchen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background shadow-sm sticky top-0 z-10">
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="flex items-center gap-3 cursor-default">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline">Kitchen</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
         {error && (
            <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg mb-8">
                 <p>{error}</p>
            </div>
        )}

        <section>
          <h2 className="text-2xl font-semibold font-headline text-primary mb-4">New Orders ({newOrders.length})</h2>
          {newOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newOrders.map((order) => (
                <OrderCard key={order.id} order={order} onOrderCompleted={handleOrderCompletion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-lg">
              <p className="text-muted-foreground">No new orders at the moment.</p>
            </div>
          )}
        </section>

        <Separator className="my-12" />

        <section>
          <h2 className="text-2xl font-semibold font-headline text-muted-foreground mb-4">Completed Orders ({completedOrders.length})</h2>
          {completedOrders.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} onOrderCompleted={handleOrderCompletion} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background rounded-lg">
              <p className="text-muted-foreground">No orders have been completed yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
