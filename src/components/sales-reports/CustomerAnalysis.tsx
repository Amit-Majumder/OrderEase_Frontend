
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Users, UserPlus, CreditCard, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CustomerAnalysisProps {
  customerData: {
    newVsReturning: { new: number, returning: number };
    highSpenders: number;
  };
  paymentData: { method: string, count: number }[];
}

const customerColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];
const paymentColors = ['hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function CustomerAnalysis({ customerData, paymentData }: CustomerAnalysisProps) {
  const customerChartData = [
    { name: 'New', value: customerData.newVsReturning.new, fill: customerColors[0] },
    { name: 'Returning', value: customerData.newVsReturning.returning, fill: customerColors[1] },
  ];
  
  const paymentChartData = paymentData.map((p, i) => ({
    name: p.method,
    value: p.count,
    fill: paymentColors[i % paymentColors.length],
  }));

  return (
    <div className="space-y-8">
      <Card className="bg-card/70 border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-cyan-400">Customer Insights</CardTitle>
          <CardDescription>A look at your customer base.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg">
                <div className="h-[100px] w-[100px]">
                    <ChartContainer config={{}} className="w-full h-full">
                         <ResponsiveContainer>
                            <PieChart>
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie data={customerChartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={45} strokeWidth={2}>
                                    {customerChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="text-center mt-2">
                    <p className="text-2xl font-bold">{customerData.newVsReturning.new + customerData.newVsReturning.returning}</p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
            </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-300 rounded-md">
                        <UserPlus className="h-5 w-5"/>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{customerData.newVsReturning.new}</p>
                        <p className="text-sm text-muted-foreground">New Customers</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 text-green-300 rounded-md">
                        <Users className="h-5 w-5"/>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{customerData.newVsReturning.returning}</p>
                        <p className="text-sm text-muted-foreground">Returning</p>
                    </div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/70 border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-cyan-400">Payment Methods</CardTitle>
          <CardDescription>How your customers are paying.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center">
               <div className="h-[150px] w-[150px]">
                  <ChartContainer config={{}} className="w-full h-full">
                     <ResponsiveContainer>
                        <PieChart>
                           <Tooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                           />
                           <Pie data={paymentChartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={5} strokeWidth={2}>
                              {paymentChartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                  </ChartContainer>
               </div>
            </div>
            <div className="space-y-4 my-auto">
               {paymentData.map((method, index) => (
                  <div key={method.method} className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: paymentColors[index % paymentColors.length] }}/>
                     <div>
                        <p className="font-bold text-lg">{method.count}</p>
                        <p className="text-sm text-muted-foreground">{method.method}</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
