
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import menuData from '@/lib/menu-data.json';
import type { MenuItem, CartItem } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderFormProps {
  onOrderCreated: () => void;
}

export function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (itemId: string) => {
    const itemToAdd = menuData.find((item) => item.id === itemId);
    if (!itemToAdd) return;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === itemId);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...(itemToAdd as MenuItem), quantity: 1 }];
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

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItems([]);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
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
        // Manually created orders are marked as paid directly
        paymentMethod: 'pay-later',
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orderv2`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      toast({
        title: 'Success',
        description: 'Order has been created successfully.',
      });

      onOrderCreated(); // Callback to refresh the kitchen view
      resetForm();
      setOpen(false);

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
  
  const isSubmitDisabled =
    items.length === 0 || !customerName.trim() || customerPhone.length !== 10 || isSubmitting;


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a New Order</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left side: Customer and Item Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Jane Doe"
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
              />
            </div>
            <div className="space-y-2">
              <Label>Add Item</Label>
              <Select onValueChange={addItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item to add..." />
                </SelectTrigger>
                <SelectContent>
                  {menuData.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (INR {item.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Right side: Order Summary */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
            <ScrollArea className="flex-grow h-48 bg-muted/50 rounded-lg p-4">
              {items.length > 0 ? (
                <div className="space-y-4">
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
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No items added yet.</p>
                </div>
              )}
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>INR {total}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
           <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
