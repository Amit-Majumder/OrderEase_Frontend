
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import { Loader2, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-300',
    paid: 'bg-yellow-500/20 text-yellow-300',
    served: 'bg-purple-500/20 text-purple-300',
}

export function OrdersSnapshot() {
  const { kitchenOrders, loading } = useOrder();

  const pendingOrders = kitchenOrders
    .filter(
      (order) =>
        order.status === 'paid' ||
        order.status === 'new' ||
        order.status === 'served'
    )
    .slice(0, 5); // Take the 5 most recent pending orders

  return (
    <Card className="bg-card/70 border-white/10 shadow-lg h-[300px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-cyan-400">Live Order Queue</CardTitle>
            <CardDescription>Most recent pending orders.</CardDescription>
          </div>
          <Button variant="ghost" asChild className="text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400">
             <Link href="/kitchen">
                View All <ArrowRight className="ml-2 h-4 w-4" />
             </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
          </div>
        ) : pendingOrders.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center bg-background/50 p-3 rounded-md">
                  <div>
                    <p className="font-bold text-white">#{order.token}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                  <Badge className={cn("capitalize", statusColors[order.status] || 'bg-gray-500')}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
             <PackageOpen className="h-10 w-10 mb-2" />
             <p>No pending orders.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
