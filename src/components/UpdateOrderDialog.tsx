
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Minus, AlertTriangle } from 'lucide-react';
import type { MenuItem, Order, OrderItem } from '@/lib/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
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
import { cn } from '@/lib/utils';
import axios from 'axios';

interface UpdateOrderDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOrderUpdated: () => void;
  order: Order;
}

interface CurrentOrderItem extends OrderItem {
  // Corresponds to MenuItem id
  menuItemId: string;
  initialQty: number; // to track the original quantity
}

export function UpdateOrderDialog({
  children,
  isOpen,
  setIsOpen,
  onOrderUpdated,
  order,
}: UpdateOrderDialogProps) {
  const [currentItems, setCurrentItems] = useState<CurrentOrderItem[]>([]);
  const [initialItems, setInitialItems] = useState<CurrentOrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOrderItems, cancelOrder } = useOrder();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const initializeItems = useCallback((menu: MenuItem[]) => {
      const items = order.items.map(item => {
        const menuItem = menu.find(mi => mi.name === item.name);
        return {
          ...item,
          menuItemId: menuItem ? menuItem.id : 'unknown-item',
          initialQty: item.quantity
        };
      }).filter(item => item.menuItemId !== 'unknown-item');
      
      setCurrentItems(items);
      setInitialItems(items);
  }, [order.items]);
  
  useEffect(() => {
    async function fetchMenu() {
      if (isOpen) {
        setLoadingMenu(true);
        setMenuError(null);
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`);
          if (response.data && Array.isArray(response.data)) {
            const formattedMenuItems: MenuItem[] = response.data.map((item: any) => ({
              id: item._id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.imageUrl,
              category: item.category,
            }));
            
            const uniqueCategories = Array.from(new Set(formattedMenuItems.map(item => item.category)));
            uniqueCategories.sort();
            formattedMenuItems.sort((a, b) => a.name.localeCompare(b.name));
            
            setMenuItems(formattedMenuItems);
            const allCategories = ['All', ...uniqueCategories];
            setCategories(allCategories);
            setActiveCategory(allCategories[0]);
            
            initializeItems(formattedMenuItems);
          } else {
            throw new Error("Invalid data format from API");
          }
        } catch (err) {
          console.error("Failed to fetch menu:", err);
          setMenuError("Could not load the menu. Please try again.");
        } finally {
          setLoadingMenu(false);
        }
      }
    }
    fetchMenu();
  }, [isOpen, order.items, initializeItems]);

  useEffect(() => {
    if (order && menuItems.length > 0) {
        initializeItems(menuItems);
    }
  }, [order, menuItems, initializeItems]);

  const updateItemQuantity = (itemToUpdate: MenuItem, newQuantity: number) => {
    setCurrentItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.menuItemId === itemToUpdate.id);
        
        if (existingItemIndex > -1) {
            const existingItem = prevItems[existingItemIndex];
            
            if (existingItem.served && newQuantity < existingItem.quantity) {
                return prevItems;
            }

            if (newQuantity <= 0) {
                 if (existingItem.served) return prevItems; 
                return prevItems.filter((_, index) => index !== existingItemIndex);
            }
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity: newQuantity };
            return updatedItems;
        } else {
            if (newQuantity > 0) {
                const newItem: CurrentOrderItem = {
                    id: 'temp-id-' + Math.random(),
                    name: itemToUpdate.name,
                    price: itemToUpdate.price,
                    quantity: newQuantity,
                    menuItemId: itemToUpdate.id,
                    served: false,
                    initialQty: 0,
                    active: newQuantity,
                    servedQty: 0,
                };
                return [...prevItems, newItem];
            }
            return prevItems;
        }
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setCurrentItems((prevItems) => {
        const itemToRemove = prevItems.find(item => item.menuItemId === menuItemId);
        if (itemToRemove?.served) {
            return prevItems;
        }
        return prevItems.filter((item) => item.menuItemId !== menuItemId);
    });
  };
  
  const totalCost = useMemo(() => {
    return currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [currentItems]);
  
  const haveItemsChanged = useMemo(() => {
    if (currentItems.length !== initialItems.length) {
      return true;
    }
    const initialMap = new Map(initialItems.map(item => [item.menuItemId, item.quantity]));
    for (const item of currentItems) {
      if (!initialMap.has(item.menuItemId) || initialMap.get(item.menuItemId) !== item.quantity) {
        return true;
      }
    }
    return false;
  }, [currentItems, initialItems]);

  const isAnyItemServed = useMemo(() => {
    return initialItems.some(item => item.served);
  }, [initialItems]);

  const isSubmitDisabled = currentItems.length === 0 || isSubmitting || !haveItemsChanged;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const itemsPayload = currentItems.map(item => {
        const initialItem = initialItems.find(i => i.menuItemId === item.menuItemId);
        return {
            menuItem: item.menuItemId,
            qty: item.quantity,
            price: item.price,
            served: initialItem ? initialItem.served : false,
            initialQty: initialItem ? initialItem.initialQty : 0
        };
    });

    const success = await updateOrderItems(order.id, {name: order.customerName, phone: order.customerPhone }, itemsPayload);

    if (success) {
      onOrderUpdated();
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  };

  const handleCancelOrder = async () => {
    const success = await cancelOrder(order.id);
    if (success) {
      onOrderUpdated();
      setIsOpen(false);
    }
  };
  
  const filteredMenuItems = useMemo(() => {
    if (activeCategory === 'All') {
      return menuItems;
    }
    return menuItems.filter(item => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-5xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Update Order #{order.token}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-4">
            <div className="md:col-span-3">
             {loadingMenu ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
             ) : menuError ? (
                <div className="flex flex-col justify-center items-center h-96 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p>{menuError}</p>
                </div>
             ) : (
                 <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mt-2 w-full">
                    <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 pb-2 flex-nowrap">
                        {categories.map((cat) => (
                            <TabsTrigger key={cat} value={cat} className="flex-shrink-0">
                            {cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value={activeCategory} className="mt-0">
                        <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-2">
                            {filteredMenuItems.map((item: MenuItem) => {
                            const currentItem = currentItems.find(ci => ci.menuItemId === item.id);
                            const quantity = currentItem?.quantity || 0;
                            const isDecrementDisabled = currentItem?.served && quantity <= currentItem.initialQty;
                            return (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                                <div className="flex flex-col">
                                    <span>{item.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="font-mono text-sm text-green-400 flex justify-between w-20">
                                        <span>INR</span>
                                        <span>{item.price}</span>
                                    </div>
                                    <div className="flex items-center justify-end w-[90px] h-8">
                                        {quantity === 0 ? (
                                            <Button size="sm" className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 w-full h-8 py-1" onClick={() => updateItemQuantity(item, 1)}>
                                              <Plus className="h-4 w-4 mr-1" /> Add
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-cyan-500 hover:bg-cyan-500/10" onClick={() => updateItemQuantity(item, quantity - 1)} disabled={isDecrementDisabled}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="font-bold text-center w-4">{quantity}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-cyan-500 hover:bg-cyan-500/10" onClick={() => updateItemQuantity(item, quantity + 1)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            )})}
                        </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
             )}
            </div>

            <div className="md:col-span-2 bg-background p-6 rounded-lg flex flex-col h-[550px]">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Order Summary</h3>
                <ScrollArea className="flex-grow pr-4 -mr-4">
                {currentItems.length > 0 ? (
                    <div className="space-y-2">
                    {currentItems.map((item) => {
                        return (
                          <div key={item.menuItemId} className="flex items-center justify-between p-2 rounded-md bg-card">
                          <div>
                            {item.name} <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="font-mono text-sm text-green-400 flex justify-between w-20">
                                  <span>INR</span>
                                  <span>{item.price * item.quantity}</span>
                              </div>
                              <Button
                                size="icon"
                                className="h-6 w-6 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                                onClick={() => handleRemoveItem(item.menuItemId)}
                                disabled={item.served}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                          </div>
                        )
                    })}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                    <p>No items in order.</p>
                    </div>
                )}
                </ScrollArea>
                <div className="mt-auto pt-4">
                  <Separator className="my-4 bg-white/10" />
                  <div className="flex justify-between items-center font-bold text-xl">
                      <span className="text-muted-foreground">New Total:</span>
                      <div className="font-mono text-green-400 flex justify-between w-28">
                          <span>INR</span>
                          <span>{totalCost}</span>
                      </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                                className="w-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                                disabled={isAnyItemServed}
                            >
                                Cancel Order
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
                            <AlertDialogCancel className={cn(buttonVariants({ variant: 'outline' }), "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-0 hover:text-cyan-300")}>No, Go Back</AlertDialogCancel>
                            <AlertDialogAction
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                            onClick={handleCancelOrder}
                            >
                            Yes, Cancel Order
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className="w-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Update Order'
                        )}
                    </Button>
                  </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
