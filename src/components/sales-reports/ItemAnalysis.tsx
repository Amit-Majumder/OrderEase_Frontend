
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ItemAnalysisProps {
  data: { name: string; quantity: number; revenue: number }[];
}

export function ItemAnalysis({ data }: ItemAnalysisProps) {
  
  const chartConfig = {
    quantity: {
      label: 'Quantity Sold',
      color: 'hsl(var(--primary))',
    },
    revenue: {
      label: 'Revenue',
       color: 'hsl(var(--chart-2))',
    }
  };

  return (
    <Card className="bg-card/70 border-white/10 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-cyan-400">Top-Selling Items</CardTitle>
        <CardDescription>Your most popular menu items by quantity sold.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px]">
           <ChartContainer config={chartConfig} className="w-full h-full">
             <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                   />
                   <Tooltip
                    cursor={{ fill: 'hsla(var(--muted), 0.2)' }}
                    content={<ChartTooltipContent
                        formatter={(value, name) => (
                             <div>
                                <p className='font-semibold capitalize'>{chartConfig[name as keyof typeof chartConfig].label}</p>
                                <p>{name === 'revenue' ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString()}</p>
                            </div>
                        )}
                        indicator="dot"
                    />}
                  />
                  <Bar dataKey="quantity" fill={chartConfig.quantity.color} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
           </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
