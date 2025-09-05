
'use client';

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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import menuData from '@/lib/menu-data.json';
import type { MenuItem } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOrderCreated: () => void;
}

interface OrderItemForm {
  id: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

export function CreateOrderDialog({
  children,
  isOpen,
  setIsOpen,
  onOrderCreated,
}: CreateOrderDialogProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<OrderItemForm[]>([]);
  const [nextItemId, setNextItemId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItems([]);
    setNextItemId(1);
  };
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems([...items, { id: nextItemId, sku: '', name: '', quantity: 1, price: 0 }]);
    setNextItemId(nextItemId + 1);
  };

  const handleItemChange = (
    id: number,
    field: keyof OrderItemForm,
    value: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'sku') {
            const menuItem = menuData.find((m) => m.id === value);
            if (menuItem) {
              updatedItem.price = menuItem.price;
              updatedItem.name = menuItem.name.toLowerCase().replace(/ /g, '-');
            }
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const isSubmitDisabled =
    !customerName.trim() ||
    customerPhone.length !== 10 ||
    items.length === 0 ||
    items.some((item) => !item.sku || item.quantity <= 0) ||
    isSubmitting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        items: items.map(item => ({
          sku: item.name,
          qty: item.quantity,
          price: item.price
        })),
        customer: {
          name: customerName,
          phone: `+91${customerPhone}`,
        },
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orderv2`,
        payload
      );

      if (res.status === 200 && res.data.token) {
        onOrderCreated();
        setIsOpen(false);
      } else {
        throw new Error('Failed to create order. Invalid response from server.');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while creating the order.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCustomerPhone(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Customer Phone</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="10-digit number"
                type="tel"
              />
            </div>
          </div>
          <div className="space-y-4">
            <Label>Order Items</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label className="text-xs text-muted-foreground">
                      Item
                    </Label>
                    <Select
                      value={item.sku}
                      onValueChange={(value) =>
                        handleItemChange(item.id, 'sku', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuData.map((menuItem: MenuItem) => (
                          <SelectItem key={menuItem.id} value={menuItem.id}>
                            {menuItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="text-xs text-muted-foreground">
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'quantity',
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="w-24">
                     <Label className="text-xs text-muted-foreground">
                      Price
                    </Label>
                    <Input value={`INR ${item.price}`} readOnly disabled />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={handleAddItem} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="flex justify-end font-bold text-xl">
            <span>Total:</span>
            <span className="ml-4">INR {total}</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
