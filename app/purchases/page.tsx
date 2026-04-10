'use client';

import { useData } from '@/lib/data-context';
import { TransactionForm } from '@/components/transaction-form';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PurchasesPage() {
  const { transactions, companies, payments, isLoaded } = useData();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const purchaseTransactions = transactions.filter((t) => t.type === 'purchase');

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const getRemainingBalance = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return 0;
    const paid = payments
      .filter((p) => p.transactionId === transactionId)
      .reduce((sum, p) => sum + p.amount, 0);
    return transaction.amount - paid;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchases</h1>
          <p className="text-sm text-muted-foreground">Manage purchase orders and track supplier payments.</p>
        </div>
        <TransactionForm type="purchase" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>A summary of all purchase transactions and outstanding balances.</CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No purchase orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No.</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium text-foreground">{transaction.invoiceNumber}</TableCell>
                    <TableCell>{getCompanyName(transaction.companyId)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(
                        payments
                          .filter((p) => p.transactionId === transaction.id)
                          .reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={getRemainingBalance(transaction.id) > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                        {formatCurrency(getRemainingBalance(transaction.id))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
