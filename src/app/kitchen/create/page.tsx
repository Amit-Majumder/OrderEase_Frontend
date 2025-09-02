
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import menuData from '@/lib/menu-data.json';
import type { MenuItem, CartItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';

export default function CreateOrderPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { fetchKitchenOrders, activeOrderIdForUpdate, clearActiveOrderId, orderToUpdate, clearOrderToUpdate } = useOrder();

  const isUpdateMode = !!activeOrderIdForUpdate;

  useEffect(() => {
    if (isUpdateMode && orderToUpdate) {
      setCustomerName(orderToUpdate.customerName);
      setCustomerPhone(orderToUpdate.customerPhone.slice(-10));
    }

    // Clear context state on unmount
    return () => {
      clearActiveOrderId();
      clearOrderToUpdate();
    }
  }, [isUpdateMode, orderToUpdate, clearActiveOrderId, clearOrderToUpdate]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (itemToAdd: MenuItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    } else {
      setItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  const handleUpdateOrder = async () => {
    if (!orderToUpdate) return;
    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          sku: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        customer: {
            name: orderToUpdate.customerName,
            phone: orderToUpdate.customerPhone,
        }
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${activeOrderIdForUpdate}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      await fetchKitchenOrders();
      router.push('/kitchen');

    } catch (err) {
      console.error('Error updating order:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while updating the order.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          sku: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        customer: {
          name: customerName,
          phone: `+91${customerPhone}`,
        },
        paymentMethod: 'pay-later',
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orderv2`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      await fetchKitchenOrders();
      router.push('/kitchen');

    } catch (err) {
      console.error('Error creating order:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while creating the order.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (isUpdateMode) {
      handleUpdateOrder();
    } else {
      handleCreateOrder();
    }
  }
  
  const isSubmitDisabled =
    items.length === 0 || 
    (!isUpdateMode && (!customerName.trim() || customerPhone.length !== 10)) || 
    isSubmitting;

  const pageTitle = isUpdateMode ? `Update Order #${orderToUpdate?.token}` : 'Create New Order';
  const pageDescription = isUpdateMode ? `Adding items for ${orderToUpdate?.customerName}.` : 'Manually enter an order for a customer.';


  return (
    <>
     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" asChild>
               <Link href="/kitchen">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Kitchen
                </Link>
            </Button>
        </div>
      </div>
    </header>
    <main className="container mx-auto py-8 px-4">
       <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{pageTitle}</h1>
          <p className="text-lg text-muted-foreground mt-2">{pageDescription}</p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left side: Customer and Item Selection */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            disabled={isUpdateMode}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number</Label>
                        <Input
                            id="customerPhone"
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 10) {
                                setCustomerPhone(value);
                            }
                            }}
                            placeholder="10-digit mobile number"
                            disabled={isUpdateMode}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Menu</CardTitle>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {menuData.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">INR {item.price}</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => addItem(item)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                     </ScrollArea>
                </CardContent>
            </Card>
        </div>
        
        {/* Right side: Order Summary */}
        <div className="sticky top-20">
          <Card>
             <CardHeader>
                <CardTitle>Order Summary</CardTitle>
             </CardHeader>
             <CardContent>
                 <ScrollArea className="h-[28rem]">
                    {items.length > 0 ? (
                        <div className="space-y-4 pr-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">INR {item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                type="number"
                                className="h-8 w-16"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                min="0"
                                />
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => updateQuantity(item.id, 0)}
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-40">
                        <p className="text-muted-foreground">No items added yet.</p>
                        </div>
                    )}
                </ScrollArea>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-xl">
                <span>{isUpdateMode ? 'Additional Amount' : 'Total'}</span>
                <span>INR {total}</span>
                </div>
             </CardContent>
             <CardFooter>
                <Button size="lg" className="w-full" onClick={handleSubmit} disabled={isSubmitDisabled}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (isUpdateMode ? 'Update Order' : 'Submit Order')}
                </Button>
             </CardFooter>
          </Card>
        </div>
      </div>
    </main>
    </>
  );
}

    