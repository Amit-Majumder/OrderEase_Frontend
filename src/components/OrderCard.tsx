
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
import { CheckCircle, CircleDashed, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { AddItemsToOrderDialog } from './AddItemsToOrderDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { completeOrder, markAsPaid, cancelOrder } = useOrder();
  const [isAddItemsDialogOpen, setIsAddItemsDialogOpen] = useState(false);

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleComplete = async () => {
    await completeOrder(order.id);
  };

  const handleMarkAsPaid = async () => {
    await markAsPaid(order.id);
  };
  
  const handleCancelOrder = async () => {
    await cancelOrder(order.id);
  };

  const phoneNumber10Digits = order.customerPhone.slice(-10);
  const isCompleted = order.status === 'done';

  const handleOrderUpdated = () => {
    // The context will automatically refetch, but we can trigger it manually if needed
    // For now, closing the dialog is enough as the context polling will handle the update.
  };

  return (
    <Card
      className={cn(
        'flex flex-col transition-all relative',
        isCompleted ? 'bg-muted/50 border-dashed' : 'bg-card'
      )}
    >
      {!isCompleted && (
        <>
          <AddItemsToOrderDialog
            isOpen={isAddItemsDialogOpen}
            setIsOpen={setIsAddItemsDialogOpen}
            order={order}
            onOrderUpdated={handleOrderUpdated}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 h-10 w-10"
              onClick={() => setIsAddItemsDialogOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </AddItemsToOrderDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-6 w-6" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently cancel order #{order.token}. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  )}
                  onClick={handleCancelOrder}
                >
                  Yes, Cancel Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      <CardHeader className="pt-16">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              {order.served ? (
                <CheckCircle className="text-accent" />
              ) : (
                <CircleDashed className="text-primary" />
              )}
              #{order.token}
            </CardTitle>
            <CardDescription>
              For: {order.customerName} ({phoneNumber10Digits}) at {time}
            </CardDescription>
          </div>
          <div className="text-lg font-bold text-right text-primary">
            INR {order.amountDue}
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
      <CardFooter className="flex gap-2">
        {order.status !== 'done' && (
          <>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleMarkAsPaid}
              disabled={order.status === 'paid'}
            >
              Paid
            </Button>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleComplete}
              disabled={order.served}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Ready
            </Button>
          </>
        )}
        {isCompleted && (
          <p className="w-full text-center text-sm text-muted-foreground">
            Order fulfilled.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
