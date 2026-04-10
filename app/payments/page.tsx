'use client';

import { useData } from '@/lib/data-context';
import { PaymentForm } from '@/components/payment-form';
import { formatCurrency, formatDate } from '@/lib/format';
import { calculateDueDate, isOverdue, getDaysOverdue, getRemainingBalance } from '@/lib/calculations';
import { AlertCircle, CheckCircle, Clock, CalendarDays, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  const { transactions, companies, payments, isLoaded } = useData();

  if (!isLoaded) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading ageing data...</p>
      </div>
    );
  }

  const getCompany = (companyId: string) => {
    return companies.find((c) => c.id === companyId);
  };

  const transactionsWithBalances = transactions
    .map((t) => {
      const company = getCompany(t.companyId);
      if (!company) return null;
      const balance = getRemainingBalance(t, payments);
      return {
        transaction: t,
        company,
        balance,
        dueDate: calculateDueDate(t, company),
        isOverdue: isOverdue(t, company),
        daysOverdue: getDaysOverdue(t, company),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && item.balance > 0)
    .sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const overdueTransactions = transactionsWithBalances.filter((item) => item.isOverdue);
  const upcomingTransactions = transactionsWithBalances.filter((item) => !item.isOverdue);

  const totalOutstanding = transactionsWithBalances.reduce((sum, item) => sum + item.balance, 0);
  const totalOverdue = overdueTransactions.reduce((sum, item) => sum + item.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments & Ageing</h1>
          <p className="text-sm text-muted-foreground">Track outstanding invoices and payment collection status.</p>
        </div>
        <PaymentForm />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-b">
          <div className="flex-1 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-tight">Outstanding</p>
                <div className="text-lg font-bold">{formatCurrency(totalOutstanding)}</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
              {transactionsWithBalances.length} invoices
            </div>
          </div>

          <div className="flex-1 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-tight text-red-700">Overdue</p>
                <div className={cn("text-lg font-bold", totalOverdue > 0 ? "text-red-600" : "text-emerald-600")}>
                  {formatCurrency(totalOverdue)}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-red-600 bg-red-100/30 px-1.5 py-0.5 rounded-full">
              {overdueTransactions.length} late
            </div>
          </div>

          <div className="flex-1 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-tight text-amber-700">Due Soon</p>
                <div className="text-lg font-bold">
                  {formatCurrency(
                    upcomingTransactions
                      .filter((item) => {
                        const daysUntilDue = Math.ceil(
                          (new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return daysUntilDue <= 7 && daysUntilDue > 0;
                      })
                      .reduce((sum, item) => sum + item.balance, 0)
                  )}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground bg-amber-50 px-1.5 py-0.5 rounded-full">7d window</p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {overdueTransactions.length > 0 && (
          <Card className="border-red-200 overflow-hidden mt-6">
            <CardHeader className="bg-red-50/30 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <div>
                  <CardTitle className="text-sm font-bold">Overdue Invoices</CardTitle>
                  <CardDescription className="text-[10px]">Exceeded payment terms.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Delay</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueTransactions.map((item) => (
                    <TableRow key={item.transaction.id}>
                      <TableCell className="font-medium text-red-700">{item.transaction.invoiceNumber}</TableCell>
                      <TableCell>{item.company.name}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(item.dueDate)}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="font-bold">
                          {item.daysOverdue} Days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {formatCurrency(item.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {upcomingTransactions.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold">Upcoming Payments</CardTitle>
                  <CardDescription className="text-[10px]">Receivable/payable within terms.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingTransactions.map((item) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const isWarning = daysUntilDue <= 7;
                    return (
                      <TableRow key={item.transaction.id}>
                        <TableCell className="font-medium">{item.transaction.invoiceNumber}</TableCell>
                        <TableCell>{item.company.name}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(item.dueDate)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={isWarning ? "border-amber-500 text-amber-600" : "text-muted-foreground"}
                          >
                            {daysUntilDue} Days
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(item.balance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {transactionsWithBalances.length === 0 && (
          <Card className="border-dashed bg-muted/20 mt-6">
            <CardContent className="py-8 text-center px-4">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-30" />
              <p className="text-muted-foreground font-bold text-sm">All payments are settled</p>
              <p className="text-[10px] text-muted-foreground">No outstanding invoices at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
