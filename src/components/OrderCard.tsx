
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
import { Eye, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { UpdateOrderDialog } from './UpdateOrderDialog';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { completeOrder, markAsPaid, cancelOrder } = useOrder();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isServing, setIsServing] = useState(false);

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleComplete = async () => {
    setIsServing(true);
    await completeOrder(order.id);
    // No need to set isServing to false, as the component will re-render
    // with a disabled button once the order status is updated.
  };

  const handleMarkAsPaid = async () => {
    setIsPaying(true);
    await markAsPaid(order.id);
  };
  
  const handleCancelOrder = async () => {
    await cancelOrder(order.id);
  };

  const phoneNumber10Digits = order.customerPhone.slice(-10);
  const isCompleted = order.status === 'done';
  const isAnyItemServedInOrder = order.items.some(item => item.served);

  const handleOrderUpdated = () => {
    // The context will automatically refetch, but we can trigger it manually if needed
    // For now, closing the dialog is enough as the context polling will handle the update.
  };

  return (
    <Dialog>
      <DialogTrigger asChild disabled={isCompleted}>
        <Card
          className={cn(
            'flex flex-col transition-all relative bg-card/70 border-white/10 shadow-lg',
            !isCompleted && 'cursor-pointer group hover:-translate-y-1',
            isCompleted ? 'h-[200px] bg-card/40 border-white/5' : 'h-[305px]'
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div
                  className={cn(
                    'font-headline text-2xl font-bold text-white/90 transition-colors',
                    !isCompleted && 'group-hover:text-cyan-400'
                  )}
                >
                  #{order.token}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  <div>Name: {order.customerName}</div>
                  <div>Phone: {phoneNumber10Digits}</div>
                </div>
              </div>
            </div>
            <div className="text-lg font-bold text-green-400 mt-2">
              INR {order.total}
            </div>
          </CardHeader>

          <CardContent className="flex-grow flex flex-col space-y-3 py-2 overflow-hidden">
            <ScrollArea
              className={cn(
                'flex-grow pr-4',
                isCompleted ? 'h-[80px]' : 'h-auto'
              )}
            >
              <ul className="space-y-1 text-sm list-disc list-inside text-white/70">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.name}
                  </li>
                ))}
              </ul>
            </ScrollArea>
            {!isCompleted && (
              <div className="flex justify-between items-center mt-auto">
                <div className="flex gap-2 items-center min-h-[28px]">
                  {order.status === 'paid' && (
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      Paid
                    </Badge>
                  )}
                  {order.served && (
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      Served
                    </Badge>
                  )}
                </div>
                <div className="text-white/60 text-sm">{time}</div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2 pt-0 mt-auto">
            {isCompleted ? (
              <div className="flex w-full justify-between items-center">
                <Badge className="bg-green-500/20 text-green-300">
                  Completed
                </Badge>
                <div className="text-white/60 text-sm">{time}</div>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  className="w-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                  onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(); }}
                  disabled={order.status === 'paid' || isPaying}
                >
                  {isPaying && order.status !== 'paid' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Paid'
                  )}
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                  onClick={(e) => { e.stopPropagation(); handleComplete(); }}
                  disabled={order.served || isServing}
                >
                  {isServing && !order.served ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Served'
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md bg-card border-border"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-cyan-400 text-2xl">
            Order #{order.token}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="text-muted-foreground">
            <p>
              <span className="font-semibold text-white/80">Name:</span>{' '}
              {order.customerName}
            </p>
            <p>
              <span className="font-semibold text-white/80">Phone:</span>{' '}
              {phoneNumber10Digits}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">
              Items
            </h3>
            <ScrollArea className="h-64 pr-4">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.id}-${item.id}-${index}`}
                    className={cn(
                        "flex justify-between items-center bg-background/50 p-3 rounded-md",
                        item.served && "opacity-50"
                    )}
                  >
                    <p className="text-white/90">
                      {item.name} x {item.quantity}
                    </p>
                    <p className="font-mono text-green-400">
                      INR {item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-xl">
            <span className="text-muted-foreground">Total:</span>
            <span className="text-green-400">INR {order.total}</span>
          </div>
        </div>
        <DialogFooter>
            <UpdateOrderDialog
                isOpen={isUpdateDialogOpen}
                setIsOpen={setIsUpdateDialogOpen}
                order={order}
                onOrderUpdated={handleOrderUpdated}
            >
                <Button
                    className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    onClick={() => setIsUpdateDialogOpen(true)}
                    disabled={order.status === 'paid'}
                >
                    Edit Order
                </Button>
            </UpdateOrderDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
