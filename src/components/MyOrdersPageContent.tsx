
'use client';

import { useSearchParams } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Search, History } from 'lucide-react';
import { Separator } from './ui/separator';

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';

export function MyOrdersPageContent() {
  const searchParams = useSearchParams();
  const phoneFromUrl = searchParams.get('phone');

  const { myOrders, fetchMyOrders, myOrdersLoading } = useOrder();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedPhone = localStorage.getItem(CUSTOMER_PHONE_KEY);
    const initialPhone = phoneFromUrl || savedPhone || '';
    setPhoneNumber(initialPhone);
    if (initialPhone) {
      fetchMyOrders(initialPhone);
    }
  }, [phoneFromUrl, fetchMyOrders]);

  const handleSearch = () => {
    if (phoneNumber.length === 10) {
      localStorage.setItem(CUSTOMER_PHONE_KEY, phoneNumber);
      fetchMyOrders(phoneNumber);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhoneNumber(value);
    }
  };
  
  if (!isClient) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">My Orders</h1>
          <p className="text-lg text-muted-foreground mt-2">Check the status of your past orders.</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Enter your 10-digit phone number</Label>
                <div className="flex gap-2">
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="e.g., 9876543210"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={phoneNumber.length !== 10 || myOrdersLoading}>
                    {myOrdersLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />
          
          {myOrdersLoading && (
             <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="mt-2 text-muted-foreground">Fetching your orders...</p>
             </div>
          )}

          {!myOrdersLoading && (
            <div className="space-y-4">
                {myOrders.length > 0 ? (
                    myOrders.map((order) => (
                        <Link href={`/order/${order.id}`} key={order.id} className="block">
                            <Card className="hover:border-primary transition-colors">
                               <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-2xl">#{order.token}</CardTitle>
                                        <span className="font-bold text-lg text-primary">INR {order.total}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.timestamp).toLocaleString()}
                                    </p>
                               </CardHeader>
                               <CardFooter>
                                    <p className="text-sm font-semibold capitalize">Status: {order.status}</p>
                               </CardFooter>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
                        <History className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No orders found for this number.</p>
                         <Button asChild className="mt-4">
                            <Link href="/menu">Place a New Order</Link>
                        </Button>
                    </div>
                )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
