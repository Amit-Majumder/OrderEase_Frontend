
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import {
  ShoppingCart,
  Loader2,
  CheckCircle,
  CircleDashed,
  Search,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';

function MyOrderCard({ order }: { order: Order }) {
  const isCompleted = order.status === 'completed';
  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      className={cn(
        'transition-all shadow-md bg-card',
        isCompleted && 'border-dashed'
      )}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 font-headline text-xl">
             {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-accent" />
              ) : (
                <CircleDashed className="h-6 w-6 text-primary animate-spin" />
              )}
            <span>Order #{order.token}</span>
          </CardTitle>
          <div className="text-right">
            <p
              className={cn(
                'font-semibold text-sm',
                isCompleted ? 'text-accent' : 'text-primary'
              )}
            >
              {isCompleted ? 'Completed' : 'In Progress'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Placed at {time}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <p className="text-muted-foreground">
                {item.name} x {item.quantity}
              </p>
              <p className="font-medium">INR {item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold text-base">
          <p>Total Paid</p>
          <p>INR {order.total}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyOrdersPage() {
  const searchParams = useSearchParams();
  
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleFindOrders = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      setOrders([]);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/myorder?phone=${phoneNumber}`
      );

      const backendOrders = res.data.orders || [];

      const fetchedOrders: Order[] = backendOrders.map((order: any) => ({
        token: order.orderToken,
        id: order._id,
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        total: order.amount,
        status: order.status,
        timestamp: new Date(order.createdAt).getTime(),
        items: order.lineItems.map((item: any) => ({
          id: item._id,
          name: item.sku,
          quantity: item.qty,
          price: item.price,
        })),
      }));

      setOrders(fetchedOrders.sort((a, b) => b.timestamp - a.timestamp));
      
      // On successful search, save the phone number to cache
      localStorage.setItem(CUSTOMER_PHONE_KEY, phoneNumber);

    } catch (err) {
      console.error('Error fetching orders by phone:', err);
      setError('Could not fetch orders. Please check the phone number or try again later.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const phoneFromUrl = searchParams.get('phone');
    const phoneFromCache = localStorage.getItem(CUSTOMER_PHONE_KEY);
    const initialPhone = phoneFromUrl || phoneFromCache || '';

    if(initialPhone){
        setPhone(initialPhone);
        setLoading(true); // Set loading to true since we'll auto-fetch
        handleFindOrders(initialPhone);
    }
  }, [searchParams, handleFindOrders]);


  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            My Orders
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Here's a list of your recent orders.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="w-full space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                 <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                 />
            </div>
            <Button onClick={() => handleFindOrders(phone)} disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Find Orders
            </Button>
          </div>

          {error && <p className="text-sm text-center text-destructive">{error}</p>}
        </div>


        <div className="max-w-2xl mx-auto mt-12 space-y-6">
          {loading && !searched && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="ml-4 text-muted-foreground">Searching for your orders...</p>
            </div>
          )}
          
          {!loading && searched && orders.length > 0 && (
             orders.map(order => (
              <MyOrderCard 
                key={order.id} 
                order={order} 
              />
            ))
          )}

          {!loading && searched && orders.length === 0 && !error &&(
             <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found for this phone number.</p>
              <Button asChild className="mt-4">
                <Link href="/menu">Go to Menu</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
