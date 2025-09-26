
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingCart, BarChart, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import type { DashboardKpis } from '@/lib/types';
import { cn } from '@/lib/utils';


// Custom INR Icon Component
const INRIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 'bold' }}>
    ₹
  </span>
);


interface StatCardsProps {
  data: DashboardKpis;
}

const formatCurrency = (value: number) => {
  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `₹${formattedValue}`;
};

export function StatCards({ data }: StatCardsProps) {
    const salesDiff = data.todaysSales - data.yesterdaysSales;
    const salesDiffPercent = data.yesterdaysSales > 0 ? (salesDiff / data.yesterdaysSales) * 100 : 100;

  const stats = [
    {
      title: "Today's Sales",
      value: formatCurrency(data.todaysSales),
      icon: TrendingUp,
      color: 'text-green-400',
      footer: (
        <div className={cn(
            "text-xs",
            salesDiff >= 0 ? "text-green-400" : "text-red-400"
        )}>
            {salesDiff >= 0 ? '+' : ''}{salesDiffPercent.toFixed(1)}% vs yesterday
        </div>
      )
    },
    {
      title: 'Orders Count',
      value: data.orderCounts.total,
      icon: ShoppingCart,
      color: 'text-cyan-400',
      footer: `${data.orderCounts.pending} pending, ${data.orderCounts.cancelled} cancelled`
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(data.averageOrderValue),
      icon: BarChart,
      color: 'text-purple-400',
      footer: `From ${data.orderCounts.total} total orders`
    },
    {
      title: 'Low Stock Items',
      value: data.lowStockItemCount,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      footer: 'Items needing attention'
    },
     {
      title: 'Peak Hour',
      value: data.peakHour,
      icon: Clock,
      color: 'text-pink-400',
      footer: "Today's busiest time"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card/70 border-white/10 shadow-lg flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.footer}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

