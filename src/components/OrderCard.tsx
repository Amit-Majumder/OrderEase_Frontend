
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import type { Order } from '@/lib/types';
import { Button } from './ui/button';
import { CheckCircle, Loader2, CircleDashed, CreditCard, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: Order;
  onOrderCompleted: (order: Order) => void;
}

export function OrderCard({ order, onOrderCompleted }: OrderCardProps) {
  const { completeOrder, markAsPaid, setActiveOrderIdForUpdate } = useOrder();
  const [isPaying, setIsPaying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();


  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handlePaid = async () => {
    setIsPaying(true);
    const success = await markAsPaid(order.id);
    if (success && isCompleting) {
        await completeOrder(order.id);
    }
    setIsPaying(false);
  }

  const handleComplete = async () => {
    setIsCompleting(true);
    if (isPaid) {
      await completeOrder(order.id);
    }
    onOrderCompleted(order);
  }

  const handleAddItems = () => {
    setActiveOrderIdForUpdate(order.id, order);
    router.push('/kitchen/create');
  };

  const phoneNumber10Digits = order.customerPhone.slice(-10);
  const isPaid = order.status === 'paid' || order.status === 'served';
  const isServed = order.status === 'served' || order.status === 'done';

  return (
    <Card
      className={cn(
        'flex flex-col transition-all',
        isServed ? 'bg-muted/50 border-dashed' : 'bg-card'
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    {isServed ? (
                        <CheckCircle className="text-accent" />
                    ) : (
                        <CircleDashed className={cn(order.status === 'created' && 'text-yellow-500', isPaid && 'text-primary' )} />
                    )}
                    #{order.token}
                </CardTitle>
                <CardDescription>
                    For: {order.customerName} ({phoneNumber10Digits}) at {time}
                </CardDescription>
            </div>
             <div className="text-lg font-bold text-right text-primary">
                INR {order.total}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-32 pr-4">
            <ul className="space-y-1 text-sm">
            {order.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                <span>
                    {item.quantity}x {item.name}
                </span>
                </li>
            ))}
            </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {!isServed ? (
             <div className="w-full flex flex-col gap-2">
                 <Button className="w-full" variant="outline" onClick={handleAddItems} disabled={isServed}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Item
                </Button>
                <div className="flex w-full gap-2">
                    <Button className="w-full" variant={isPaid ? 'outline' : 'default'} onClick={handlePaid} disabled={isPaid || isPaying}>
                        {isPaying ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <CreditCard className="mr-2 h-4 w-4" /> )}
                        {isPaid ? 'Paid' : 'Mark as Paid'}
                    </Button>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleComplete} disabled={isCompleting}>
                        {isCompleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        {isCompleting ? 'Completing...' : 'Mark as Complete'}
                    </Button>
                </div>
            </div>
        ) : (
           <p className="w-full text-center text-sm text-muted-foreground">Order fulfilled.</p>
        )}
      </CardFooter>
    </Card>
  );
}
