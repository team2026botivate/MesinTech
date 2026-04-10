'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ExpenseForm } from '@/components/expense-form';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X, Wallet, CheckCircle2, Clock } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, companies, isLoaded } = useData();
  const [filterCategory, setFilterCategory] = useState<'all' | 'courier' | 'travel' | 'food' | 'other'>('all');

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return 'General';
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const filteredExpenses = expenses.filter((e) => filterCategory === 'all' || e.category === filterCategory);

  const categoryIcons = {
    courier: '📦',
    travel: '✈️',
    food: '🍽️',
    other: '📋',
  };

  const categoryLabels = {
    courier: 'Courier',
    travel: 'Travel',
    food: 'Food',
    other: 'Other',
  };

  const calculateCategoryTotal = (category: string) => {
    return expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Track and manage business operational costs.</p>
        </div>
        <ExpenseForm />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-b">
          <div className="flex-1 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-tight">Total Volume</p>
                <div className="text-lg font-bold">{formatCurrency(totalExpenses)}</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
              {expenses.length} records
            </div>
          </div>

          <div className="flex-1 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-tight">Approved</p>
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(approvedTotal)}</div>
              </div>
            </div>
            <div className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              {expenses.filter((e) => e.status === 'approved').length} verified
            </div>
          </div>

          <div className="flex-1 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-tight">Pending</p>
                <div className="text-lg font-bold text-amber-600">{formatCurrency(pendingTotal)}</div>
              </div>
            </div>
            <div className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
              {expenses.filter((e) => e.status === 'pending').length} waiting
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-muted/10 border-none shadow-none">
        <div className="flex flex-wrap md:flex-nowrap divide-x divide-muted-foreground/10">
          {(['courier', 'travel', 'food', 'other'] as const).map((category) => (
            <div key={category} className="flex-1 p-2.5 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <span className="text-base">{categoryIcons[category]}</span>
                <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/80">{categoryLabels[category]}</p>
              </div>
              <div className="text-sm font-bold text-foreground/80">{formatCurrency(calculateCategoryTotal(category))}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-bold">Expense Records</CardTitle>
          <CardDescription className="text-xs">A detailed list of all tracked business costs.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs
            defaultValue="all"
            onValueChange={(v) => setFilterCategory(v as any)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="courier">Courier</TabsTrigger>
              <TabsTrigger value="travel">Travel</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No records found in this category
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          <span className="mr-2">{categoryIcons[expense.category]}</span>
                          {expense.description}
                        </TableCell>
                        <TableCell className="capitalize">{expense.category}</TableCell>
                        <TableCell className="text-muted-foreground italic">
                          {getCompanyName(expense.companyId)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={expense.status === 'approved' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-amber-500 text-amber-600 bg-amber-50'}
                          >
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
