'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { TransactionForm } from '@/components/transaction-form';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvoiceDialog } from '@/components/invoice-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function SalesPage() {
  const { transactions, companies, payments, isLoaded } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  const salesTransactions = transactions.filter((t) => t.type === 'sale');
  const customers = companies.filter((c) => c.type === 'customer');

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

  const getPaymentStatus = (transactionId: string) => {
    const balance = getRemainingBalance(transactionId);
    if (balance <= 0) return 'paid';
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction && transaction.amountPaid > 0) return 'partial';
    return 'pending';
  };

  const filteredTransactions = useMemo(() => {
    return salesTransactions.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCompanyName(t.companyId).toLowerCase().includes(searchQuery.toLowerCase());

      const status = getPaymentStatus(t.id);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      const matchesCustomer = customerFilter === 'all' || t.companyId === customerFilter;

      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [salesTransactions, searchQuery, statusFilter, customerFilter, companies, payments, transactions]);



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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground">Manage sales invoices and track customer billing.</p>
        </div>
        <TransactionForm type="sale" />
      </div>



      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Invoices</CardTitle>
              <CardDescription>A list of all sales transactions and their payment status.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-muted-foreground/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sales invoices found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Invoice</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Paid</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Balance</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const status = getPaymentStatus(transaction.id);
                    const paidAmount = payments
                      .filter((p) => p.transactionId === transaction.id)
                      .reduce((sum, p) => sum + p.amount, 0);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.invoiceNumber}</TableCell>
                        <TableCell>{getCompanyName(transaction.companyId)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          <span className={getRemainingBalance(transaction.id) > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            {formatCurrency(getRemainingBalance(transaction.id))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === 'paid'
                                ? 'secondary'
                                : status === 'partial'
                                ? 'outline'
                                : 'default'
                            }
                            className={
                              status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                : status === 'partial'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                : 'bg-destructive text-white'
                            }
                          >
                            {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <InvoiceDialog transaction={transaction} company={companies.find(c => c.id === transaction.companyId)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}