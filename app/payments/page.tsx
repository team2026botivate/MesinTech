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
        <p className="text-muted-foreground animate-pulse">Loading ageing reports...</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground mt-1">{transactionsWithBalances.length} pending invoices</p>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", totalOverdue > 0 ? "text-red-600" : "text-emerald-600")}>
              {formatCurrency(totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{overdueTransactions.length} overdue record(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon (7d)</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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
            <p className="text-xs text-muted-foreground mt-1">Nearing terms deadline</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {overdueTransactions.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="bg-red-50/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <CardTitle className="text-lg">Overdue Invoices</CardTitle>
                  <CardDescription>Invoices that have exceeded their payment terms.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Upcoming Payments</CardTitle>
                  <CardDescription>Accounts receivable/payable within terms.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
          <Card className="border-dashed bg-muted/20">
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground text-lg">All payments are settled</p>
              <p className="text-sm text-muted-foreground">You have no outstanding invoices at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
