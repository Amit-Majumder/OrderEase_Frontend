
'use client';

import { ShoppingCart } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MyCartButton() {
  const { cartCount } = useOrder();
  const pathname = usePathname();
  const isActive = pathname === '/my-cart';

  return (
    <Button variant={isActive ? 'default' : 'ghost'} asChild className="relative">
      <Link href="/my-cart" className="flex items-center gap-2">
        <ShoppingCart />
        {cartCount > 0 && (
          <Badge
            variant={isActive ? 'secondary' : 'default'}
            className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0"
          >
            {cartCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
