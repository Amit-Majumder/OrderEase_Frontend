
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Building } from 'lucide-react';
import type { Branch } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { useOrder } from '@/context/OrderContext';
import { BranchList } from '@/components/branches/BranchList';
import { AddBranchDialog } from '@/components/branches/AddBranchDialog';
import { EditBranchDialog } from '@/components/branches/EditBranchDialog';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAddBranchDialogOpen, setIsAddBranchDialogOpen } = useOrder();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`/api/branch`);
      if (response.data && Array.isArray(response.data)) {
        const formattedBranches: Branch[] = response.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          pin: item.PIN,
          phone: item.phone,
          address: item.address,
        }));
        setBranches(formattedBranches);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch branches:', err);
      setError(err.message || 'Could not load branches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleBranchAdded = () => {
    fetchBranches();
  };
  
  const handleBranchUpdated = () => {
    fetchBranches();
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
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
          {branches.length > 0 ? (
            <BranchList branches={branches} onEdit={handleEditClick} />
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
              <Building className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No branches found.</p>
              <p className="text-sm text-muted-foreground mt-2">Click "+ Add Branch" to get started.</p>
            </div>
          )}
        </div>
      )}

      <AddBranchDialog
        isOpen={isAddBranchDialogOpen}
        setIsOpen={setIsAddBranchDialogOpen}
        onBranchAdded={handleBranchAdded}
      />
      
      {selectedBranch && (
        <EditBranchDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            onBranchUpdated={handleBranchUpdated}
            branch={selectedBranch}
        />
      )}
    </div>
  );
}
