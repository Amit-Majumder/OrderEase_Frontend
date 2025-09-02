
'use client';

import { OrderCard } from '@/components/OrderCard';
import { ChefHat, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/lib/types';
import { useOrder } from '@/context/OrderContext';
import { KitchenHeader } from '@/components/KitchenHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function KitchenPage() {
  const { kitchenOrders, setKitchenOrders, loading, error, completeOrder } = useOrder();

  const handleOrderCompletion = (order: Order) => {
    // This function is called when the 'Mark as Complete' button is clicked.
    // It checks if the order is already paid. If so, it marks it as served.
    if (order.status === 'paid') {
        completeOrder(order.id);
    }
  };

  const newOrders = kitchenOrders.filter((order) => order.status !== 'served' && order.status !== 'done');
  const completedOrders = kitchenOrders.filter((order) => order.status === 'served' || order.status === 'done');

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
       <KitchenHeader />

      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Our Kitchen</h1>
            <p className="text-lg text-muted-foreground mt-2">Manage and track live orders.</p>
        </div>
        
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
                <OrderCard key={order.id} order={order} onOrderCompleted={() => {}} />
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
