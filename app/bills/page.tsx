'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { TransactionForm } from '@/components/transaction-form';
import { InvoiceDialog } from '@/components/invoice-dialog';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Printer, ArrowUpDown } from 'lucide-react';
import { Transaction } from '@/lib/types';

export default function BillsPage() {
  const { transactions, companies, payments, isLoaded } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const allTransactions = transactions;

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const getRemainingBalance = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return 0;
    const paid = payments
      .filter((p) => p.linkedTransactionId === transactionId)
      .reduce((sum, p) => sum + p.amount, 0);
    return (transaction.totalAmount || 0) - paid;
  };

  const getPaymentStatus = (transactionId: string) => {
    const balance = getRemainingBalance(transactionId);
    if (balance <= 0) return 'paid';
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction && transaction.amountPaid > 0) return 'partial';
    return 'pending';
  };

  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter((t) => {
        const matchesSearch =
          searchQuery === '' ||
          t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getCompanyName(t.companyId).toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || t.type === typeFilter;

        const status = getPaymentStatus(t.id);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          const amountA = a.totalAmount || 0;
          const amountB = b.totalAmount || 0;
          return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
        }
      });
  }, [allTransactions, searchQuery, typeFilter, statusFilter, sortField, sortOrder, companies, payments, transactions]);

  const totalSales = filteredTransactions.filter((t) => t.type === 'sale').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPurchases = filteredTransactions.filter((t) => t.type === 'purchase').reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPending = filteredTransactions.filter((t) => getPaymentStatus(t.id) !== 'paid').reduce((sum, t) => sum + getRemainingBalance(t.id), 0);

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bills</h1>
          <p className="text-sm text-muted-foreground">Manage Sales and Purchase orders, edit and print invoices.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalPurchases)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Type</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Serial No.</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Party</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">
                    <button
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">
                    <button
                      className="flex items-center gap-1 hover:text-primary ml-auto"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Paid</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Balance</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const status = getPaymentStatus(transaction.id);
                    const paidAmount = payments
                      .filter((p) => p.linkedTransactionId === transaction.id)
                      .reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={transaction.type === 'sale' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}
                          >
                            {transaction.type === 'sale' ? 'Sale' : 'Purchase'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.serialNumber}</TableCell>
                        <TableCell>{getCompanyName(transaction.companyId)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(transaction.totalAmount)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(paidAmount)}</TableCell>
                        <TableCell className="text-right">
                          <span className={getRemainingBalance(transaction.id) > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
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
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => setEditingTransaction(transaction)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <InvoiceDialog
                              transaction={transaction}
                              company={companies.find((c) => c.id === transaction.companyId)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingTransaction && (
        <TransactionForm
          type={editingTransaction.type}
          editTransaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}