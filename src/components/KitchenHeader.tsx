
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { PlusCircle, Utensils } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';

export function KitchenHeader() {
  const { clearActiveOrderId, clearOrderToUpdate } = useOrder();

  const handleCreateClick = () => {
    clearActiveOrderId();
    clearOrderToUpdate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-8 w-8 text-foreground" />
            <span className="text-2xl font-bold font-headline text-primary">OrderEase</span>
        </Link>
        <nav className="flex items-center gap-1">
           <Button asChild onClick={handleCreateClick}>
              <Link href="/kitchen/create">
                <PlusCircle className="mr-2" />
                Create Order
              </Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
