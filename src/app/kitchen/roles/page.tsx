
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import type { StaffMember } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';
import { StaffList } from '@/components/roles/StaffList';
import { AddStaffDialog } from '@/components/roles/AddStaffDialog';

export default function RolesPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAddStaffDialogOpen, setIsAddStaffDialogOpen } = useOrder();

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const branchId = getBranchId();
      if (!branchId) {
        throw new Error("Branch ID not found. Please log in again.");
      }
      const response = await axiosInstance.get(`/api/profiles?branch=${branchId}`);
      if (response.data && Array.isArray(response.data.staff)) {
        const formattedStaff: StaffMember[] = response.data.staff.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          role: item.role,
        }));
        setStaff(formattedStaff);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
      setError(err.message || 'Could not load staff members. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleStaffAdded = () => {
    fetchStaff();
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
          {staff.length > 0 ? (
            <StaffList staff={staff} />
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No staff members found.</p>
              <p className="text-sm text-muted-foreground mt-2">Click "+ Add Staff" to get started.</p>
            </div>
          )}
        </div>
      )}

      <AddStaffDialog
        isOpen={isAddStaffDialogOpen}
        setIsOpen={setIsAddStaffDialogOpen}
        onStaffAdded={handleStaffAdded}
      />
    </div>
  );
}
