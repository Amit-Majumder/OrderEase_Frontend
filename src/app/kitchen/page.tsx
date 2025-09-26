
'use client';

import { OrderCard } from '@/components/OrderCard';
import { Loader2 } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function KitchenPage() {
  const { kitchenOrders, loading, error } = useOrder();

  const newOrders = kitchenOrders
    .filter(
      (order) =>
        order.status === 'paid' ||
        order.status === 'new' ||
        order.status === 'served'
    )
    .sort((a, b) => b.timestamp - a.timestamp);
  const completedOrders = kitchenOrders.filter(
    (order) => order.status === 'done'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg mb-8">
          <p>{error}</p>
        </div>
      )}

      <Tabs defaultValue="new-orders">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="new-orders">
            New Orders ({newOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed-orders">
            Completed Orders ({completedOrders.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="new-orders">
          <div className="mt-6">
            {newOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {newOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg mt-8">
                <p className="text-muted-foreground">
                  No new orders at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed-orders">
          <div className="mt-6">
            {completedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {completedOrders.map((order) => (
                  <div key={order.id} className="opacity-60">
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-lg mt-8">
                <p className="text-muted-foreground">
                  No completed orders at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
