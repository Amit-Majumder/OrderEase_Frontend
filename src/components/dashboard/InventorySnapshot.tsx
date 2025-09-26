
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface InventorySnapshotProps {
    lowStockItems: { name: string; quantity: number; unit: string }[];
}

export function InventorySnapshot({ lowStockItems }: InventorySnapshotProps) {
  return (
    <Card className="bg-card/70 border-white/10 shadow-lg h-[300px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
           <div>
             <CardTitle className="text-cyan-400">Inventory Snapshot</CardTitle>
             <CardDescription>Items running low on stock.</CardDescription>
           </div>
           <Button variant="ghost" asChild className="text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-400">
             <Link href="/kitchen/inventory">
                Manage <ArrowRight className="ml-2 h-4 w-4" />
             </Link>
           </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {lowStockItems.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
                {lowStockItems.map(item => (
                    <div key={item.name} className="flex justify-between items-center bg-background/50 p-3 rounded-md">
                        <p className="text-white">{item.name}</p>
                        <p className="font-mono text-yellow-400">{item.quantity} {item.unit}</p>
                    </div>
                ))}
            </div>
          </ScrollArea>
        ) : (
             <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                <PackageOpen className="h-10 w-10 mb-2" />
                <p>No low stock items.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
