
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  BookOpen,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Table,
  User,
  Search,
} from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: Search, label: 'Orders', href: '/kitchen' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/kitchen/dashboard' },
  { icon: BarChart, label: 'Sales Report', href: '/kitchen/sales-reports' },
  { icon: Boxes, label: 'Inventory', href: '/kitchen/inventory' },
  { icon: BookOpen, label: 'Menu Management', href: '/kitchen/menu-management' },
];

const bottomMenuItems = [
  { icon: Settings, label: 'Settings', href: '#' },
  { icon: User, label: 'Profile', href: '#' },
  { icon: LogOut, label: 'Logout', href: '#' },
];

export function KitchenSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // Track the pathname to close sidebar on navigation
  const [initialPath, setInitialPath] = useState(pathname);
  
  useEffect(() => {
    // If the sidebar is open and the path changes, close the sidebar.
    if (isOpen && pathname !== initialPath) {
      setIsOpen(false);
    }
    // Update the initial path whenever the path changes.
    setInitialPath(pathname);
  }, [pathname, isOpen, initialPath]);

  // When the sheet is opened, we need to update the initial path
  // to prevent it from closing immediately if the path is different
  // from the last time it was open.
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setInitialPath(pathname);
    }
    setIsOpen(open);
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/kitchen/login');
    setIsOpen(false);
  };


  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 p-2 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-card w-[270px] p-4 flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="text-cyan-400 font-headline text-2xl text-center">
            Main Menu
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col flex-grow">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  asChild
                  className={cn(
                    'justify-start text-base text-white/80 hover:bg-cyan-500/10 hover:text-cyan-300',
                    isActive && 'bg-cyan-500/20 text-cyan-300'
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-4 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="mt-auto">
            <Separator className="my-4 bg-white/10" />
            <nav className="flex flex-col gap-2">
              {bottomMenuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start text-base text-white/80 hover:bg-cyan-500/10 hover:text-cyan-300"
                  onClick={item.label === 'Logout' ? handleLogout : () => setIsOpen(false)}
                >
                  <item.icon className="mr-4 h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
