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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">{expenses.length} record(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(approvedTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.filter((e) => e.status === 'approved').length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.filter((e) => e.status === 'pending').length} awaiting
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {(['courier', 'travel', 'food', 'other'] as const).map((category) => (
          <Card key={category} className="bg-muted/30">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <span>{categoryIcons[category]}</span>
                {categoryLabels[category]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold">{formatCurrency(calculateCategoryTotal(category))}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>A detailed list of all tracked business costs.</CardDescription>
        </CardHeader>
        <CardContent>
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
