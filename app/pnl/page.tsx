'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, AlertCircle, CheckCircle, Clock, AlertTriangle, Users, BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface TransactionWithStatus extends ReturnType<typeof import('@/lib/types').Transaction> {
  isOverdue: boolean;
  daysOverdue: number;
  profitStatus: 'profit' | 'loss' | 'pending';
}

const monthlyChartConfig = {
  net: {
    label: "Net Result",
  },
  profit: {
    label: "Profit",
    color: "#10b981",
  },
  loss: {
    label: "Loss",
    color: "#ef4444",
  },
} satisfies ChartConfig

const profitPieConfig = {
  value: {
    label: "Amount",
  },
  profit: {
    label: "Profit",
    color: "#10b981",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  loss: {
    label: "Loss",
    color: "#ef4444",
  },
} satisfies ChartConfig

export default function PNLPage() {
  const { transactions, companies, payments, returns, products, isLoaded } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  const getCompany = (companyId: string) => companies.find(c => c.id === companyId);
  const getCompanyName = (companyId: string) => getCompany(companyId)?.name || 'Unknown';
  const getPaymentTerms = (companyId: string) => getCompany(companyId)?.paymentTermsDays || 0;

  const calculateDueDate = (transactionDate: string, paymentTerms: number): Date => {
    const date = new Date(transactionDate);
    date.setDate(date.getDate() + paymentTerms);
    return date;
  };

  const getPaidAmount = (transactionId: string) => {
    return payments
      .filter(p => p.linkedTransactionId === transactionId)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getRemainingBalance = (transaction: { totalAmount: number }) => {
    return (transaction.totalAmount || 0) - getPaidAmount(transaction.id);
  };

  const getDaysOverdue = (transactionDate: string, paymentTerms: number): number => {
    const dueDate = calculateDueDate(transactionDate, paymentTerms);
    const today = new Date();
    if (dueDate >= today) return 0;
    return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getProfitStatus = (transaction: { totalAmount?: number; id: string; type: string }): 'profit' | 'loss' | 'pending' => {
    const paidAmount = getPaidAmount(transaction.id);
    if (paidAmount >= (transaction.totalAmount || 0)) return 'profit';
    const company = companies.find(c => c.id === transaction.companyId);
    if (company && getDaysOverdue(transaction.date, company.paymentTermsDays) > 0) return 'loss';
    return 'pending';
  };

  const sales = useMemo(() => transactions.filter(t => t.type === 'sale' && (selectedCompanyId === 'all' || t.companyId === selectedCompanyId)), [transactions, selectedCompanyId]);
  const purchases = useMemo(() => transactions.filter(t => t.type === 'purchase' && (selectedCompanyId === 'all' || t.companyId === selectedCompanyId)), [transactions, selectedCompanyId]);

  const salesReturns = useMemo(
    () => returns.filter(r => r.type === 'sale' && r.status === 'approved'),
    [returns]
  );
  const purchaseReturns = useMemo(
    () => returns.filter(r => r.type === 'purchase' && r.status === 'approved'),
    [returns]
  );

  const salesProfit = useMemo(() => {
    return sales
      .filter(t => getProfitStatus(t) === 'profit')
      .reduce((sum, t) => sum + t.totalAmount, 0);
  }, [sales, payments, companies]);

  const salesPending = useMemo(() => {
    return sales
      .filter(t => getProfitStatus(t) === 'pending')
      .reduce((sum, t) => sum + getRemainingBalance(t), 0);
  }, [sales, payments, companies]);

  const salesLoss = useMemo(() => {
    return sales
      .filter(t => getProfitStatus(t) === 'loss')
      .reduce((sum, t) => sum + getRemainingBalance(t), 0);
  }, [sales, payments, companies]);

  const purchaseProfit = useMemo(() => {
    return purchases
      .filter(t => getProfitStatus(t) === 'profit')
      .reduce((sum, t) => sum + t.totalAmount, 0);
  }, [purchases, payments, companies]);

  const purchasePending = useMemo(() => {
    return purchases
      .filter(t => getProfitStatus(t) === 'pending')
      .reduce((sum, t) => sum + getRemainingBalance(t), 0);
  }, [purchases, payments, companies]);

  const purchaseLoss = useMemo(() => {
    return purchases
      .filter(t => getProfitStatus(t) === 'loss')
      .reduce((sum, t) => sum + getRemainingBalance(t), 0);
  }, [purchases, payments, companies]);

  const totalSalesReturns = useMemo(
    () => salesReturns.reduce((sum, r) => sum + (r.refundAmount || r.debitNoteAmount || 0), 0),
    [salesReturns]
  );
  const totalPurchaseReturns = useMemo(
    () => purchaseReturns.reduce((sum, r) => sum + (r.refundAmount || r.debitNoteAmount || 0), 0),
    [purchaseReturns]
  );

  const netProfit = salesProfit - purchaseProfit - totalSalesReturns + totalPurchaseReturns;
  const netLoss = salesLoss - purchaseLoss;
  const netPending = salesPending - purchasePending;

  const salesProfitList = useMemo(
    () =>
      sales
        .filter(t => getProfitStatus(t) === 'profit')
        .map(t => ({
          ...t,
          daysOverdue: getDaysOverdue(t.date, getPaymentTerms(t.companyId)),
          profitStatus: 'profit' as const
        })),
    [sales, payments, companies]
  );

  const salesLossList = useMemo(
    () =>
      sales
        .filter(t => getProfitStatus(t) === 'loss')
        .map(t => ({
          ...t,
          daysOverdue: getDaysOverdue(t.date, getPaymentTerms(t.companyId)),
          profitStatus: 'loss' as const
        })),
    [sales, payments, companies]
  );

  const salesPendingList = useMemo(
    () =>
      sales
        .filter(t => getProfitStatus(t) === 'pending')
        .map(t => ({
          ...t,
          daysOverdue: getDaysOverdue(t.date, getPaymentTerms(t.companyId)),
          profitStatus: 'pending' as const
        })),
    [sales, payments, companies]
  );

  const filteredSalesProfit = salesProfitList.filter(
    t =>
      t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyName(t.companyId).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSalesLoss = salesLossList.filter(
    t =>
      t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyName(t.companyId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSalesPending = salesPendingList.filter(
    t =>
      t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyName(t.companyId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pieChartData = useMemo(() => [
    { category: 'profit', value: salesProfit, fill: "#10b981" },
    { category: 'pending', value: salesPending, fill: "#f59e0b" },
    { category: 'loss', value: salesLoss, fill: "#ef4444" },
  ].filter(d => d.value > 0), [salesProfit, salesPending, salesLoss]);

  const customerRiskData = useMemo(() => {
    const customerStats: Record<string, { 
      name: string; 
      totalSales: number; 
      overdueCount: number; 
      pendingCount: number; 
      paidCount: number;
      overdueAmount: number;
      pendingAmount: number;
    }> = {};

    sales.forEach(t => {
      const company = getCompany(t.companyId);
      if (!company) return;
      
      if (!customerStats[company.id]) {
        customerStats[company.id] = {
          name: company.name,
          totalSales: 0,
          overdueCount: 0,
          pendingCount: 0,
          paidCount: 0,
          overdueAmount: 0,
          pendingAmount: 0,
        };
      }

      const status = getProfitStatus(t);
      const balance = getRemainingBalance(t);

      customerStats[company.id].totalSales += t.totalAmount;
      
      if (status === 'profit') {
        customerStats[company.id].paidCount++;
      } else if (status === 'pending') {
        customerStats[company.id].pendingCount++;
        customerStats[company.id].pendingAmount += balance;
      } else if (status === 'loss') {
        customerStats[company.id].overdueCount++;
        customerStats[company.id].overdueAmount += balance;
      }
    });

    return Object.entries(customerStats)
      .map(([id, stats]) => ({
        id,
        ...stats,
        totalTransactions: stats.paidCount + stats.pendingCount + stats.overdueCount,
        overduePercentage: stats.totalTransactions > 0 
          ? Math.round((stats.overdueCount / stats.totalTransactions) * 100) 
          : 0,
        riskLevel: stats.overduePercentage > 30 || stats.overdueCount >= 3 ? 'poor' 
          : stats.overduePercentage > 10 || stats.overdueCount >= 1 ? 'medium' 
          : 'good',
      }))
      .filter(c => c.totalTransactions > 0)
      .sort((a, b) => b.overdueAmount - a.overdueAmount);
  }, [sales, companies, payments]);

  const monthlyTrendData = useMemo(() => {
    const months: Record<string, { monthKey: string; month: string; profit: number; loss: number; pending: number }> = {};
    
    sales.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!months[monthKey]) {
        months[monthKey] = { monthKey, month: monthName, profit: 0, loss: 0, pending: 0 };
      }
      
      const status = getProfitStatus(t);
      const balance = getRemainingBalance(t);
      
      if (status === 'profit') {
        months[monthKey].profit += t.totalAmount;
      } else if (status === 'pending') {
        months[monthKey].pending += balance;
      } else if (status === 'loss') {
        months[monthKey].loss += balance;
      }
    });

    return Object.values(months)
      .map(m => ({
        ...m,
        net: m.profit - m.loss // Net amount for the "Negative" Bar Chart style
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [sales, payments, companies]);

  const trendData = useMemo(() => {
    if (monthlyTrendData.length < 2) return { percentage: 0, isUp: true };
    const current = monthlyTrendData[monthlyTrendData.length - 1].profit;
    const previous = monthlyTrendData[monthlyTrendData.length - 2].profit;
    if (previous === 0) return { percentage: 0, isUp: true };
    const percentage = Math.round(((current - previous) / previous) * 100);
    return { percentage, isUp: percentage >= 0 };
  }, [monthlyTrendData]);

  const topCustomersAtRisk = useMemo(() => 
    customerRiskData.filter(c => c.riskLevel !== 'good').slice(0, 5),
  [customerRiskData]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profit & Loss Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track profit and loss based on payment status and due dates.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[220px] bg-background border-muted-foreground/20">
              <SelectValue placeholder="Select customer/vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers/Vendors</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name} ({company.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Profit Distribution
            </CardTitle>
            <CardDescription>Breakdown by payment status</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={profitPieConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent 
                      nameKey="value" 
                      hideLabel 
                      formatter={(value, name, item) => (
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-muted-foreground min-w-[60px]">
                            {profitPieConfig[item.name as keyof typeof profitPieConfig]?.label} :
                          </span>
                          <span className="font-bold text-foreground">
                            ₹ {Number(value).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie 
                  data={pieChartData} 
                  dataKey="value" 
                  nameKey="category"
                >
                  <LabelList
                    dataKey="category"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: string) =>
                      profitPieConfig[value as keyof typeof profitPieConfig]?.label
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Overall collection rate: {Math.round((salesProfit / (salesProfit + salesPending + salesLoss)) * 100) || 0}% 
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="leading-none text-muted-foreground text-center">
              Distribution of sales revenue based on payment lifecycle
            </div>
          </CardFooter>
        </Card>

        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Collection Trend
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-70">Net collected vs overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={monthlyTrendData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={
                    <ChartTooltipContent 
                      hideLabel 
                      formatter={(value) => (
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-muted-foreground whitespace-nowrap">Net Result :</span>
                          <span className={Number(value) >= 0 ? "text-emerald-600" : "text-red-600"}>
                            {Number(value) >= 0 ? "Profit" : "Loss"}
                          </span>
                          <span className="text-foreground font-bold">
                            ₹ {Math.abs(Number(value)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                  {monthlyTrendData.map((item) => (
                    <Cell
                      key={item.monthKey}
                      fill={item.net >= 0 ? "#10b981" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4 mt-2">
            <div className="flex gap-2 leading-none font-bold text-base">
              {trendData.isUp ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  Collections up by {trendData.percentage}% this month <TrendingUp className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  Collections down by {Math.abs(trendData.percentage)}% this month <TrendingDown className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="leading-none text-muted-foreground font-medium">
              Net balance performance across the last {monthlyTrendData.length} active months
            </div>
          </CardFooter>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="loss">Loss</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by serial or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase">Serial</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Customer</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Date</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Terms</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Due Date</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Days</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Amount</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Paid</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Balance</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...salesProfitList, ...salesPendingList, ...salesLossList]
                      .filter(
                        t =>
                          t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          getCompanyName(t.companyId).toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 50)
                      .map(t => {
                        const paidAmount = getPaidAmount(t.id);
                        const balance = getRemainingBalance(t);
                        const status = getProfitStatus(t);
                        const paymentTerms = getPaymentTerms(t.companyId);
                        const dueDate = calculateDueDate(t.date, paymentTerms);
                        const today = new Date();
                        const daysPassed = Math.floor((today.getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24));
                        const daysRemaining = Math.max(0, paymentTerms - daysPassed);
                        const daysOverdue = Math.max(0, daysPassed - paymentTerms);
                        
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.serialNumber}</TableCell>
                            <TableCell className="whitespace-nowrap">{getCompanyName(t.companyId)}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(t.date)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <span className="text-xs bg-muted px-2 py-1 rounded">{paymentTerms} days</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {formatDate(dueDate.toISOString())}
                            </TableCell>
                            <TableCell>
                              {status === 'loss' ? (
                                <span className="text-red-600 font-medium">-{daysOverdue} overdue</span>
                              ) : status === 'pending' ? (
                                <span className="text-amber-600">{daysRemaining} left</span>
                              ) : (
                                <span className="text-emerald-600">Paid</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(t.totalAmount)}</TableCell>
                            <TableCell className="text-right text-muted-foreground whitespace-nowrap">{formatCurrency(paidAmount)}</TableCell>
                            <TableCell className={cn("text-right font-semibold whitespace-nowrap", status === 'loss' && balance > 0 ? "text-red-600" : "")}>
                              {formatCurrency(balance)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={status === 'profit' ? 'secondary' : status === 'loss' ? 'destructive' : 'outline'}
                                className={
                                  status === 'profit'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                    : status === 'loss'
                                    ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                }
                              >
                                {status === 'profit' ? 'Profit' : status === 'loss' ? 'Loss' : 'Pending'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {[...salesProfitList, ...salesPendingList, ...salesLossList].length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                          No sales transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
                Profit (Paid Sales)
              </CardTitle>
              <CardDescription>Sales where payment has been received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by serial or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase">Serial</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Customer</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Date</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Amount</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Paid</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalesProfit.map(t => {
                      const paidAmount = getPaidAmount(t.id);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.serialNumber}</TableCell>
                          <TableCell>{getCompanyName(t.companyId)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(t.totalAmount)}</TableCell>
                          <TableCell className="text-right text-emerald-600">{formatCurrency(paidAmount)}</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-800">Profit</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredSalesProfit.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No paid sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <span className="text-sm text-muted-foreground">Total Profit: </span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(salesProfit)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Clock className="h-5 w-5" />
                Pending Sales
              </CardTitle>
              <CardDescription>Sales awaiting payment (not overdue)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by serial or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase">Serial</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Customer</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Date</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Amount</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Paid</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Balance</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalesPending.map(t => {
                      const paidAmount = getPaidAmount(t.id);
                      const balance = getRemainingBalance(t);
                      const company = getCompany(t.companyId);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.serialNumber}</TableCell>
                          <TableCell>{getCompanyName(t.companyId)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(t.totalAmount)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(paidAmount)}</TableCell>
                          <TableCell className="text-right font-semibold text-amber-600">{formatCurrency(balance)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {company ? formatDate(calculateDueDate(t.date, company.paymentTermsDays).toISOString()) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredSalesPending.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No pending sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <span className="text-sm text-muted-foreground">Total Pending: </span>
                <span className="text-lg font-bold text-amber-600">{formatCurrency(salesPending)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Loss (Overdue Sales)
              </CardTitle>
              <CardDescription>Sales where due date has passed and payment not received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by serial or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase">Serial</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Customer</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Date</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Amount</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Paid</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase">Balance</TableHead>
                      <TableHead className="font-bold text-xs uppercase">Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalesLoss.map(t => {
                      const paidAmount = getPaidAmount(t.id);
                      const balance = getRemainingBalance(t);
                      const daysOverdue = getDaysOverdue(t.date, getPaymentTerms(t.companyId));
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.serialNumber}</TableCell>
                          <TableCell>{getCompanyName(t.companyId)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(t.date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(t.totalAmount)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(paidAmount)}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">{formatCurrency(balance)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              {daysOverdue} days
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredSalesLoss.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No overdue sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-right">
                <span className="text-sm text-muted-foreground">Total Loss: </span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(salesLoss)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}