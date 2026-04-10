'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { calculatePLView } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PieChart, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportView = 'realized' | 'expected' | 'riskAdjusted';

export default function ReportsPage() {
  const { transactions, companies, payments, returns, expenses, isLoaded } = useData();
  const [activeView, setActiveView] = useState<ReportView>('expected');

  if (!isLoaded) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Generating financial models...</p>
      </div>
    );
  }

  const plView = calculatePLView(transactions, companies, payments, returns, expenses);

  const views = [
    {
      id: 'realized' as ReportView,
      label: 'Realised P&L',
      description: 'Based on actual cash flows (payments received and made)',
      data: plView.realized,
    },
    {
      id: 'expected' as ReportView,
      label: 'Expected P&L',
      description: 'Based on total invoiced amounts regardless of payment status',
      data: plView.expected,
    },
    {
      id: 'riskAdjusted' as ReportView,
      label: 'Risk-Adjusted P&L',
      description: 'Expected profit adjusted for time-value and delay losses',
      data: {
        sales: plView.riskAdjusted.sales,
        purchases: plView.riskAdjusted.purchases,
        profit: plView.riskAdjusted.profit,
      },
    },
  ];

  const currentView = views.find((v) => v.id === activeView)!;
  const isPositive = currentView.data.profit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">Comprehensive P&L analysis and health metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
          {views.map((view) => (
            <Button
              key={view.id}
              variant={activeView === view.id ? 'default' : 'ghost'}
              onClick={() => setActiveView(view.id)}
              size="sm"
              className="px-3 py-1 h-8 text-xs font-semibold"
            >
              {view.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* P&L Statement */}
          <Card className="overflow-hidden border-2 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" />
                <div>
                  <CardTitle>{currentView.label} Statement</CardTitle>
                  <CardDescription>{currentView.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-6 flex justify-between items-center group hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Revenue</p>
                    <p className="text-sm font-medium">Total Sales</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    {formatCurrency(currentView.data.sales)}
                  </span>
                </div>

                <div className="p-6 flex justify-between items-center group hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Expenditure</p>
                    <p className="text-sm font-medium">Cost of Goods Sold (Purchases)</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    ({formatCurrency(currentView.data.purchases)})
                  </span>
                </div>

                <div className="p-6 flex justify-between items-center bg-muted/5">
                  <p className="text-sm font-bold uppercase tracking-wider text-foreground">Gross Operating Profit</p>
                  <span className="text-xl font-bold text-foreground">
                    {formatCurrency(currentView.data.sales - currentView.data.purchases)}
                  </span>
                </div>

                {activeView === 'riskAdjusted' && (
                  <div className="p-6 space-y-3 bg-red-50/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-700">Accumulated Delay Losses</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">
                        ({formatCurrency(plView.riskAdjusted.delayLosses)})
                      </span>
                    </div>
                    <div className="bg-background/80 p-2 rounded border border-red-100 text-[11px] text-red-700 leading-tight">
                      Calculated at 0.05% opportunity cost per overdue day on outstanding receivables.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className={cn(
              "p-6 text-white border-t-0",
              isPositive ? "bg-emerald-600" : "bg-red-600"
            )}>
              <div className="flex w-full justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest opacity-80">Net {isPositive ? 'Profit' : 'Loss'}</span>
                <span className="text-3xl font-black">{formatCurrency(currentView.data.profit)}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader className="pb-3 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Scenario Comparison</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px]">Model</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Purchases</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-xs py-3 uppercase tracking-wider">Realised</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(plView.realized.sales)}</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(plView.realized.purchases)}</TableCell>
                    <TableCell className={cn("text-right py-3 font-bold", plView.realized.profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(plView.realized.profit)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-xs py-3 uppercase tracking-wider">Expected</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(plView.expected.sales)}</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(plView.expected.purchases)}</TableCell>
                    <TableCell className={cn("text-right py-3 font-bold", plView.expected.profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(plView.expected.profit)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-bold text-xs py-3 uppercase tracking-widest text-primary">Risk-Adj</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(plView.riskAdjusted.sales)}</TableCell>
                    <TableCell className="text-right py-3">{formatCurrency(plView.riskAdjusted.purchases)}</TableCell>
                    <TableCell className={cn("text-right py-3 font-bold", plView.riskAdjusted.profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {formatCurrency(plView.riskAdjusted.profit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-black uppercase tracking-tighter">Profit Margin</CardDescription>
                  <Info className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <CardTitle className="text-2xl font-black">
                  {currentView.data.sales > 0
                    ? ((currentView.data.profit / currentView.data.sales) * 100).toFixed(1)
                    : '0'}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-muted-foreground">Net profit as percentage of total sales revenue.</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-black uppercase tracking-tighter">COGS Intensity</CardDescription>
                  <Info className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <CardTitle className="text-2xl font-black">
                  {currentView.data.sales > 0
                    ? ((currentView.data.purchases / currentView.data.sales) * 100).toFixed(1)
                    : '0'}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-muted-foreground">Percentage of revenue attributed to direct purchase costs.</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[10px] font-black uppercase tracking-tighter">Gross Margin</CardDescription>
                  <Info className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <CardTitle className="text-2xl font-black">
                  {currentView.data.sales > 0
                    ? (((currentView.data.sales - currentView.data.purchases) / currentView.data.sales) * 100).toFixed(1)
                    : '0'}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-muted-foreground">Direct profitability before considering losses or risks.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
