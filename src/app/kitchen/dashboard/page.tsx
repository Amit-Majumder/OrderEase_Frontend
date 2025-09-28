
'use client';

import { StatCards } from '@/components/dashboard/StatCards';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { DashboardData } from '@/lib/types';
import { OrdersSnapshot } from '@/components/dashboard/OrdersSnapshot';
import { InventorySnapshot } from '@/components/dashboard/InventorySnapshot';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const branchId = getBranchId();
        if (!branchId) {
            throw new Error("Branch ID not found. Please log in again.");
        }
        const response = await axiosInstance.get(
          `/api/kitchen/dashboard-stats`,
          { params: { branch: branchId } }
        );
        const apiData = response.data;
        
        // The backend now provides all necessary data, so we map it directly.
        setData({
          kpis: apiData.kpis,
          salesTodayByHour: apiData.salesTodayByHour,
          salesYesterdayByHour: apiData.salesYesterdayByHour,
          lowStockItems: apiData.lowStockItems,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Could not load dashboard data. Please try again later.');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 bg-card rounded-lg">
        <p className="text-muted-foreground">No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StatCards data={data.kpis} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
           <SalesChart todayData={data.salesTodayByHour} yesterdayData={data.salesYesterdayByHour} />
        </div>
        <div className="space-y-8">
           <OrdersSnapshot />
           <InventorySnapshot lowStockItems={data.lowStockItems} />
        </div>
      </div>
    </div>
  );
}
