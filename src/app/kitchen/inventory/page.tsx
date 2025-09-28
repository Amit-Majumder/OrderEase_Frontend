
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, PackageOpen } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditIngredientDialog } from '@/components/inventory/EditIngredientDialog';
import { AddIngredientDialog } from '@/components/inventory/AddIngredientDialog';
import { useOrder } from '@/context/OrderContext';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAddIngredientDialogOpen, setIsAddIngredientDialogOpen } = useOrder();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const branchId = getBranchId();
      if (!branchId) {
        throw new Error("Branch ID not found. Please log in again.");
      }
      const response = await axiosInstance.get(
        `/api/ingredients?branch=${branchId}`
      );
      if (response.data && Array.isArray(response.data)) {
        const formattedInventory: Ingredient[] = response.data.map(
          (item: any) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          })
        );
        // Sort the inventory alphabetically by name
        const sortedInventory = formattedInventory.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setInventory(sortedInventory);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      setError(err.message || 'Could not load the inventory. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleIngredientAdded = () => {
    fetchInventory();
  };

  const handleIngredientUpdated = () => {
    fetchInventory();
  };

  const handleIngredientDeleted = () => {
    fetchInventory();
  };
  
  const handleEditClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
       {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
        ) : error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg">{error}</p>
        </div>
        ) : (
        <div>
            {inventory.length > 0 ? (
                <div>
                    <h2 className="text-xl font-semibold text-cyan-400 mb-6">Stock Levels</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                        {inventory.map((item) => (
                             <Card 
                                key={item.id} 
                                className="group bg-card/70 border-white/10 shadow-lg flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1"
                                onClick={() => handleEditClick(item)}
                            >
                                <CardHeader className="p-4 pb-2 flex-grow">
                                    <CardTitle className="text-lg text-white transition-colors group-hover:text-cyan-400">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-green-400">{`${item.quantity} ${item.unit}`}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
                    <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No inventory items found.</p>
                    <p className="text-sm text-muted-foreground mt-2">Click "+ Add Ingredient" to get started.</p>
                </div>
            )}
        </div>
        )}
        
        {selectedIngredient && (
            <EditIngredientDialog
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                onIngredientUpdated={handleIngredientUpdated}
                onIngredientDeleted={handleIngredientDeleted}
                ingredient={selectedIngredient}
            />
        )}

        <AddIngredientDialog
            isOpen={isAddIngredientDialogOpen}
            setIsOpen={setIsAddIngredientDialogOpen}
            onIngredientAdded={handleIngredientAdded}
        />
    </div>
  );
}
