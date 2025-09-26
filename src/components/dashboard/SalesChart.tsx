'use client';

import { Bar, BarChart, Line, ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';


interface SalesChartProps {
  todayData: { hour: string; revenue: number }[];
  yesterdayData: { hour: string; revenue: number }[];
}


export function SalesChart({ todayData, yesterdayData }: SalesChartProps) {
  
  const combinedData = todayData.map((today, index) => ({
    hour: today.hour,
    today: today.revenue,
    yesterday: yesterdayData[index]?.revenue || 0,
  }));
  
  const chartConfig = {
    today: {
      label: 'Today',
      color: 'hsl(var(--primary))',
    },
    yesterday: {
      label: 'Yesterday',
      color: 'hsl(var(--muted-foreground))',
    },
  };
  
  return (
    <Card className="bg-card/70 border-white/10 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-cyan-400">Live Sales Overview</CardTitle>
        <CardDescription>Today's revenue compared to yesterday</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ComposedChart 
                data={combinedData} 
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis
                dataKey="hour"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                // Show fewer ticks to avoid clutter
                interval={2} 
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: 'hsla(var(--muted), 0.2)' }}
                content={<ChartTooltipContent
                    formatter={(value, name) => (
                         <div>
                            <p className='font-semibold capitalize'>{name}</p>
                            <p>₹{Number(value).toLocaleString()}</p>
                        </div>
                    )}
                    indicator="dot"
                />}
              />
               <defs>
                 <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                 </linearGradient>
              </defs>
              <Bar dataKey="today" fill="url(#colorToday)" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="yesterday" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} strokeDasharray="3 3" />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
