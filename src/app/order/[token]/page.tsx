
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import axios from 'axios';
import type { Order } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';
const CUSTOMER_NAME_KEY = 'customerName';

export default function OrderSuccessPage() {
  const { token: uniqueId } = useParams(); // This is the unique ID from the URL
  const { addMyOrderToken } = useOrder();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (typeof uniqueId !== 'string') {
        setError('Invalid order ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/detail?id=${uniqueId}`
        );
        
        const backendOrder = res.data;

        if (backendOrder && backendOrder.orderToken) {
          // Manually map the backend response to our frontend Order type
          const fetchedOrder: Order = {
            id: backendOrder._id,
            token: backendOrder.orderToken,
            customerName: backendOrder.customer.name,
            customerPhone: backendOrder.customer.phone,
            total: backendOrder.amount,
            status: backendOrder.status === 'paid' ? 'new' : backendOrder.status,
            timestamp: new Date(backendOrder.createdAt).getTime(),
            items: backendOrder.lineItems.map((item: any) => ({
              id: item._id,
              name: item.sku,
              quantity: item.qty,
              price: item.price,
            })),
          };

          setOrder(fetchedOrder);
          addMyOrderToken(fetchedOrder.token);
          
          // Save customer details to localStorage
          try {
            const phoneNumber10Digits = fetchedOrder.customerPhone.slice(-10);
            localStorage.setItem(CUSTOMER_PHONE_KEY, phoneNumber10Digits);
            localStorage.setItem(CUSTOMER_NAME_KEY, fetchedOrder.customerName);
          } catch(e) {
            console.error("Could not write to localStorage", e);
          }

        } else {
          setError(`No order found for this ID, or the response was malformed.`);
        }

      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Could not retrieve your order details. Please contact support.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [uniqueId, addMyOrderToken]);

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Confirming your order...</p>
      </div>
    );
  }

  if (error) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 text-center">
         <p className="text-destructive">{error}</p>
         <Button asChild className="mt-4">
            <Link href="/menu">Go to Menu</Link>
         </Button>
       </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 text-center">
        <p className="text-muted-foreground">Order details could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link href="/menu">Go to Menu</Link>
        </Button>
      </div>
    );
  }

  // Extract the last 10 digits from the phone number
  const phoneNumber10Digits = order.customerPhone.slice(-10);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
        <CardHeader className="text-center bg-accent text-accent-foreground p-6 rounded-t-lg">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl font-headline">Order Placed!</CardTitle>
          <p className="text-lg">Thank you, {order.customerName}!</p>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-2">
            Your token number is:
          </p>
          <p className="text-8xl font-bold text-primary tracking-tighter font-mono">
            {order.token}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            We will contact you at {phoneNumber10Digits} if needed.
          </p>
          
          <Separator className="my-6" />

          <div className="text-left">
             <h3 className="text-lg font-semibold mb-4 text-center">Order Summary</h3>
             <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <p className="text-muted-foreground">{item.name} x {item.quantity}</p>
                    <p className="font-medium">INR {item.price * item.quantity}</p>
                  </div>
                ))}
             </div>
             <Separator className="my-4" />
             <div className="flex justify-between font-bold text-lg">
                <p>Total Paid</p>
                <p>INR {order.total}</p>
             </div>
          </div>

        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button asChild className="w-full">
            <Link href={`/my-orders?phone=${phoneNumber10Digits}`}>View My Orders</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/menu">Place Another Order</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
