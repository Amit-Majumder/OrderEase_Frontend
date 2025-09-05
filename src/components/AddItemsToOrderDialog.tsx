
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
import type { MenuItem, Order } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { useOrder } from '@/context/OrderContext';
import { useToast } from '@/hooks/use-toast';

interface AddItemsToOrderDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOrderUpdated: () => void;
  order: Order;
}

interface OrderItemForm {
  id: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

export function AddItemsToOrderDialog({
  children,
  isOpen,
  setIsOpen,
  onOrderUpdated,
  order,
}: AddItemsToOrderDialogProps) {
  const [items, setItems] = useState<OrderItemForm[]>([]);
  const [nextItemId, setNextItemId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOrderItems } = useOrder();
  const { toast } = useToast();

  const resetForm = () => {
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
    items.length === 0 ||
    items.some((item) => !item.sku || item.quantity <= 0) ||
    isSubmitting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const newItemsPayload = items.map(item => ({
        sku: item.name,
        qty: item.quantity,
        price: item.price
    }));

    const success = await updateOrderItems(order.id, {name: order.customerName, phone: order.customerPhone}, newItemsPayload);

    if (success) {
      onOrderUpdated();
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Items to Order #{order.token}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <Label>New Items</Label>
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
            <span>Additional Cost:</span>
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
            {isSubmitting ? 'Adding...' : 'Add Items to Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

