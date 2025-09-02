
'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import { MinusCircle, PlusCircle, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';
const CUSTOMER_NAME_KEY = 'customerName';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    clearCart,
    activeOrderIdForUpdate,
    clearActiveOrderId,
    setMyOrders,
    myOrders,
  } = useOrder();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState<'payNow' | 'payLater' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const savedPhone = localStorage.getItem(CUSTOMER_PHONE_KEY);
      if (savedPhone) setCustomerPhone(savedPhone);
      const savedName = localStorage.getItem(CUSTOMER_NAME_KEY);
      if (savedName) setCustomerName(savedName);
    } catch (error) {
      console.error("Could not read from localStorage", error);
    }
  }, []);
  
  const saveCustomerDetails = () => {
     localStorage.setItem(CUSTOMER_PHONE_KEY, customerPhone);
     localStorage.setItem(CUSTOMER_NAME_KEY, customerName);
  }

  const handleUpdateOrder = async (paymentMethod: 'pay-later' | 'online') => {
    if (!activeOrderIdForUpdate) return;
    setLoading(paymentMethod === 'pay-later' ? 'payLater' : 'payNow');
    
    try {
      const payload = {
        items: cart.map(item => ({
          sku: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        paymentMethod,
      };

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${activeOrderIdForUpdate}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      
      const order = res.data;
      
      clearCart();
      clearActiveOrderId();

      if (paymentMethod === 'online' && order.checkoutPageUrl) {
         window.location.href = order.checkoutPageUrl;
      } else {
        // For pay-later or if online payment doesn't return a URL, go to the order page
        router.push(`/order/${activeOrderIdForUpdate}`);
      }

    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while updating your order.',
      });
      setLoading(null);
    }
  };


  const handleCreateOrder = async (paymentMethod: 'pay-later' | 'online') => {
    setLoading(paymentMethod === 'pay-later' ? 'payLater' : 'payNow');
    saveCustomerDetails();

    try {
      const payload = {
        items: cart.map(item => ({
          sku: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        customer: {
          name: customerName,
          phone: `+91${customerPhone}`,
        },
        paymentMethod,
      };
      
      const endpoint = paymentMethod === 'pay-later' ? '/api/orderv2' : '/api/orders';

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      clearCart();

      if (paymentMethod === 'online') {
        const backendOrder = res.data;
        if (backendOrder && backendOrder.checkoutPageUrl) {
           window.location.href = backendOrder.checkoutPageUrl;
        } else {
            throw new Error("Could not get payment URL from backend for online payment.");
        }
      } else {
        // For 'pay-later'
        const backendOrder = res.data;
        if (backendOrder && backendOrder.id) {
            router.push(`/order/${backendOrder.id}`);
        } else {
            throw new Error("Could not get order confirmation details from backend.");
        }
      }
    } catch (err) {
      console.error("Error placing order:", err);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: (err as Error).message || 'Something went wrong while placing your order.',
      });
      setLoading(null);
    }
  };

  const handlePayNow = () => {
    if (activeOrderIdForUpdate) {
      handleUpdateOrder('online');
    } else {
      handleCreateOrder('online');
    }
  };
  
  const handlePayLater = () => {
    if (activeOrderIdForUpdate) {
      handleUpdateOrder('pay-later');
    } else {
      handleCreateOrder('pay-later');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) setCustomerName(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) setCustomerPhone(value);
  };

  const isCheckoutDisabled =
    cart.length === 0 ||
    (!activeOrderIdForUpdate && (!customerName.trim() || customerPhone.length !== 10)) ||
    !!loading;

  if (!isClient) return null;

  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            {activeOrderIdForUpdate ? 'Add Items to Order' : 'My Cart'}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            You have {cartCount} items ready to be added.
          </p>
        </div>

        {cart.length > 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          INR {item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{activeOrderIdForUpdate ? 'Confirm Items' : 'Checkout'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>{activeOrderIdForUpdate ? 'Additional Amount' : 'Total'}</span>
                  <span>INR {cartTotal}</span>
                </div>
                {!activeOrderIdForUpdate && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Your Name</Label>
                      <Input id="customerName" value={customerName} onChange={handleNameChange} placeholder="e.g. John D." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input id="customerPhone" type="tel" value={customerPhone} onChange={handlePhoneChange} placeholder="e.g. 9876543210" />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                <Button size="lg" className="w-full" onClick={handlePayLater} disabled={isCheckoutDisabled}>
                  {loading === 'payLater' ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( activeOrderIdForUpdate ? 'Add & Pay Later' : 'Pay Later' )}
                </Button>
                <Button size="lg" className="w-full" onClick={handlePayNow} disabled={isCheckoutDisabled}>
                  {loading === 'payNow' ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( activeOrderIdForUpdate ? 'Add & Pay Now' : 'Pay Now' )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/menu">Go to Menu</Link>
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
