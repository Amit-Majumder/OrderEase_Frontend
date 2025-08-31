
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
import { CheckCircle, Loader2, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';

interface OrderCardProps {
  order: Order;
  onOrderCompleted: (orderId: string) => void;
}

export function OrderCard({ order, onOrderCompleted }: OrderCardProps) {
  const { completeOrder } = useOrder();
  const [isCompleting, setIsCompleting] = useState(false);

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleComplete = async () => {
    setIsCompleting(true);
    const success = await completeOrder(order.id);
    if (success) {
      onOrderCompleted(order.id); // Notify parent component to update UI
    }
    setIsCompleting(false);
  }

  const phoneNumber10Digits = order.customerPhone.slice(-10);


  return (
    <Card
      className={cn(
        'flex flex-col transition-all',
        order.status === 'completed' ? 'bg-muted/50 border-dashed' : 'bg-card'
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    {order.status === 'completed' ? (
                        <CheckCircle className="text-accent" />
                    ) : (
                        <CircleDashed className="text-primary animate-spin" />
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
      <CardFooter>
        {order.status === 'paid' && (
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleComplete} disabled={isCompleting}>
            {isCompleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isCompleting ? 'Completing...' : 'Mark as Complete'}
          </Button>
        )}
        {order.status === 'completed' && (
           <p className="w-full text-center text-sm text-muted-foreground">Order fulfilled.</p>
        )}
      </CardFooter>
    </Card>
  );
}
