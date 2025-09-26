
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DateRangePicker } from '@/components/sales-reports/DateRangePicker';
import { SalesReportStatCards } from '@/components/sales-reports/StatCards';
import { SalesReportChart } from '@/components/sales-reports/SalesReportChart';
import { OrdersTable } from '@/components/sales-reports/OrdersTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import type { FullSalesReportData } from '@/lib/types';
import { ItemAnalysis } from '@/components/sales-reports/ItemAnalysis';
import { CustomerAnalysis } from '@/components/sales-reports/CustomerAnalysis';
import { axiosInstance } from '@/lib/axios-instance';

export default function SalesReportPage() {
  const [data, setData] = useState<FullSalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  useEffect(() => {
    // Set initial date range on client to avoid hydration mismatch
    setDateRange({
        from: addDays(new Date(), -29),
        to: new Date(),
    });
  }, []);

  const fetchSalesReportData = useCallback(async (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
        setLoading(true);
        return;
    }

    setLoading(true);
    setError(null);

    const startDate = format(startOfDay(range.from), 'yyyy-MM-dd');
    const endDate = format(endOfDay(range.to), 'yyyy-MM-dd');

    try {
      const response = await axiosInstance.get(
        `/api/kitchen/sales-report`,
        { params: { startDate, endDate } }
      );
      
      // The backend now returns the full structured data.
      setData(response.data);

    } catch (err) {
      console.error('Failed to fetch sales report data:', err);
      setError('Could not load sales report data. Please try again later.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesReportData(dateRange);
  }, [fetchSalesReportData, dateRange]);


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">Sales Report</h1>
        <DateRangePicker onDateChange={setDateRange} initialRange={dateRange} />
      </div>

      {loading && (
         <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
         </div>
      )}

      {error && (
         <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg">
            <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && data && (
        <>
            <SalesReportStatCards data={data.summary} />
            
            <SalesReportChart data={data.salesTrend} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ItemAnalysis data={data.itemAnalysis.topSellingItems} />
                <CustomerAnalysis 
                    customerData={data.customerInsights}
                    paymentData={data.paymentMethods} 
                />
            </div>
            
            <Card className="bg-card/70 border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-cyan-400">Detailed Order History</CardTitle>
                </CardHeader>
                <CardContent>
                    <OrdersTable data={data.detailedOrders} />
                </CardContent>
            </Card>
        </>
      )}

      {!loading && !error && !data && (
         <div className="text-center py-16 bg-card rounded-lg">
              <p className="text-muted-foreground">No sales data available for the selected period.</p>
         </div>
      )}
    </div>
  );
}
