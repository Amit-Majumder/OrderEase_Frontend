
'use client';

import { Button } from '@/components/ui/button';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { useState, useEffect } from 'react';
import { KitchenSidebar } from '@/components/KitchenSidebar';
import { Plus, Search, LayoutDashboard, BarChart, Boxes, BookOpen, User, Building, Users, ChevronsUpDown, Check } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { usePathname } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import type { Branch } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { cn } from '@/lib/utils';


export function KitchenHeader() {
  const {
    fetchKitchenOrders,
    setIsAddMenuItemDialogOpen,
    setIsAddIngredientDialogOpen,
    setIsAddStaffDialogOpen,
    setIsAddBranchDialogOpen,
  } = useOrder();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  const [currentBranch, setCurrentBranch] = useState<{ id: string; name: string } | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isBranchSwitcherOpen, setIsBranchSwitcherOpen] = useState(false);


  useEffect(() => {
    setIsClient(true);
    
    async function fetchBranchesAndSetCurrent() {
        try {
            const response = await axiosInstance.get('/api/branch');
             if (response.data && Array.isArray(response.data)) {
                const formattedBranches: Branch[] = response.data.map((item: any) => ({
                  id: item._id,
                  name: item.name,
                  pin: item.PIN,
                  phone: item.phone,
                  address: item.address,
                }));
                setAllBranches(formattedBranches);

                 const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    const profile = JSON.parse(storedProfile);
                    if (profile && profile.branchid && profile.branchName) {
                        setCurrentBranch({ id: profile.branchid, name: profile.branchName });
                    } else if (formattedBranches.length > 0) {
                        // If no branch is set, default to the first one
                        handleBranchSelect(formattedBranches[0]);
                    }
                } else if (formattedBranches.length > 0) {
                    handleBranchSelect(formattedBranches[0]);
                }
             }
        } catch (e) {
            console.error("Failed to fetch branches or parse user profile", e);
        }
    }
    
    fetchBranchesAndSetCurrent();
  }, []);

  const handleBranchSelect = (branch: Branch) => {
    try {
        const storedProfile = localStorage.getItem('userProfile');
        const profile = storedProfile ? JSON.parse(storedProfile) : {};
        
        const newProfile = {
            ...profile,
            branchid: branch.id,
            branchName: branch.name,
        };

        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        setCurrentBranch({ id: branch.id, name: branch.name });
        setIsBranchSwitcherOpen(false);

        // Reload the page to ensure all data is refetched for the new branch
        window.location.reload();

    } catch(e) {
        console.error("Failed to update branch selection", e);
    }
  };


  const getPageInfo = () => {
    if (pathname === '/kitchen/dashboard') {
      return {
        icon: <LayoutDashboard className="h-6 w-6" />,
        title: 'Dashboard',
      };
    }
    if (pathname === '/kitchen/sales-reports') {
      return {
        icon: <BarChart className="h-6 w-6" />,
        title: 'Sales Report',
      };
    }
     if (pathname === '/kitchen/inventory') {
      return {
        icon: <Boxes className="h-6 w-6" />,
        title: 'Inventory',
      };
    }
    if (pathname === '/kitchen/menu-management') {
      return {
        icon: <BookOpen className="h-6 w-6" />,
        title: 'Menu Management',
      };
    }
     if (pathname === '/kitchen/profile') {
      return {
        icon: <User className="h-6 w-6" />,
        title: 'Profile',
      };
    }
    if (pathname === '/kitchen/roles') {
        return {
            icon: <Users className="h-6 w-6" />,
            title: 'Roles',
        };
    }
    if (pathname === '/kitchen/branches') {
        return {
            icon: <Building className="h-6 w-6" />,
            title: 'Branches',
        };
    }
    return {
      icon: <Search className="h-6 w-6" />,
      title: 'Orders',
    };
  };


  
  const HeaderContent = () => {
     const { icon, title } = getPageInfo();
     return (
        <>
            <div className="flex items-center gap-4">
                <KitchenSidebar />
                 <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/20 text-cyan-300 p-2 rounded-lg">
                    {icon}
                    </div>
                    <h1 className="text-3xl font-bold font-headline text-white">
                    {title}
                    </h1>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 {currentBranch && (
                    <Popover open={isBranchSwitcherOpen} onOpenChange={setIsBranchSwitcherOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isBranchSwitcherOpen}
                            className="w-auto justify-start text-base font-medium text-white h-10 px-4 bg-card/70 border-white/10 hover:bg-card hover:text-white"
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-3"></div>
                                {currentBranch.name}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0 bg-card">
                            <Command>
                            <CommandInput placeholder="Search branch..." />
                            <CommandList>
                            <CommandEmpty>No branch found.</CommandEmpty>
                            <CommandGroup>
                                {allBranches.map((branch) => (
                                <CommandItem
                                    key={branch.id}
                                    value={branch.name}
                                    onSelect={() => handleBranchSelect(branch)}
                                >
                                    <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        currentBranch.id === branch.id ? "opacity-100" : "opacity-0"
                                    )}
                                    />
                                    {branch.name}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
                {pathname === '/kitchen/inventory' && (
                <Button
                    className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    onClick={() => setIsAddIngredientDialogOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                </Button>
                )}
                {pathname === '/kitchen/menu-management' && (
                <Button
                    className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    onClick={() => setIsAddMenuItemDialogOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
                )}
                {pathname === '/kitchen/roles' && (
                <Button
                    className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    onClick={() => setIsAddStaffDialogOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
                )}
                {pathname === '/kitchen/branches' && (
                <Button
                    className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                    onClick={() => setIsAddBranchDialogOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Branch
                </Button>
                )}
            </div>
        </>
     )
  }


  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b border-white/10">
      <div className="p-4 flex justify-between items-center min-h-[88px]">
        {isClient ? <HeaderContent /> : (
            <div className="w-full flex justify-between">
                <div className="h-10 w-1/3 bg-muted/50 animate-pulse rounded-md"></div>
                <div className="h-10 w-1/4 bg-muted/50 animate-pulse rounded-md"></div>
            </div>
        )}
      </div>
    </header>
  );
}
