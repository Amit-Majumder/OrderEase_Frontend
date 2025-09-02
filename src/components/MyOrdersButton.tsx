
'use client';

import { ListOrdered } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePathname, useRouter } from 'next/navigation';

export function MyOrdersButton() {
  const { inProgressOrderCount, myOrders } = useOrder();
  const pathname = usePathname();
  const router = useRouter();
  
  // The page is now `/order/[token]` not `/my-orders`
  const isActive = pathname.startsWith('/order');

  const handleMyOrdersClick = () => {
    // If there is an order, navigate to the latest one's detail page.
    // The `myOrders` list is sorted by timestamp descending in the context.
    if (myOrders.length > 0) {
      router.push(`/order/${myOrders[0].id}`);
    } else {
      // Fallback to the menu page if no orders are in the context.
      router.push('/menu');
    }
  };

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      onClick={handleMyOrdersClick}
      className="relative"
    >
      <ListOrdered />
      {inProgressOrderCount > 0 && (
        <Badge
          variant={isActive ? 'secondary' : 'default'}
          className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0"
        >
          {inProgressOrderCount}
        </Badge>
      )}
    </Button>
  );
}
