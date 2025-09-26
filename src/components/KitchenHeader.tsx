
'use client';

import { Button } from '@/components/ui/button';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { useState, useEffect } from 'react';
import { KitchenSidebar } from '@/components/KitchenSidebar';
import { Plus, Search, LayoutDashboard, BarChart, Boxes, BookOpen } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function KitchenHeader() {
  const { fetchKitchenOrders, setIsAddMenuItemDialogOpen, setIsAddIngredientDialogOpen } = useOrder();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const isDashboard = pathname === '/kitchen/dashboard';
  const isSalesReports = pathname === '/kitchen/sales-reports';
  const isInventory = pathname === '/kitchen/inventory';
  const isMenuManagement = pathname === '/kitchen/menu-management';

  const handleOrderCreated = () => {
    fetchKitchenOrders();
  };
  
  const getPageInfo = () => {
    if (isDashboard) {
      return {
        href: '/kitchen/dashboard',
        icon: <LayoutDashboard className="h-6 w-6" />,
        title: 'Dashboard',
      };
    }
    if (isSalesReports) {
      return {
        href: '/kitchen/sales-reports',
        icon: <BarChart className="h-6 w-6" />,
        title: 'Sales Report',
      };
    }
     if (isInventory) {
      return {
        href: '/kitchen/inventory',
        icon: <Boxes className="h-6 w-6" />,
        title: 'Inventory',
      };
    }
    if (isMenuManagement) {
      return {
        href: '/kitchen/menu-management',
        icon: <BookOpen className="h-6 w-6" />,
        title: 'Menu Management',
      };
    }
    return {
      href: '/kitchen',
      icon: <Search className="h-6 w-6" />,
      title: 'Orders',
    };
  };

  const { href, icon, title } = getPageInfo();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isClient && <KitchenSidebar />}
          <Link href={href}>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="bg-cyan-500/20 text-cyan-300 p-2 rounded-lg">
                {icon}
              </div>
              <h1 className="text-3xl font-bold font-headline text-white">
                {title}
              </h1>
            </div>
          </Link>
        </div>
        
        {isClient && pathname === '/kitchen' && (
          <CreateOrderDialog
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
            onOrderCreated={handleOrderCreated}
          >
            <Button
              className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </CreateOrderDialog>
        )}

        {isClient && isInventory && (
           <Button 
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                onClick={() => setIsAddIngredientDialogOpen(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
            </Button>
        )}
        
         {isClient && isMenuManagement && (
            <Button 
                className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                onClick={() => setIsAddMenuItemDialogOpen(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
            </Button>
        )}

      </div>
    </header>
  );
}
