'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpenseForm } from '@/components/expense-form';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, CheckCircle2, Clock, Package, Plane, Utensils, FileText, Search, Filter } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, companies, isLoaded } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const categoryIcons = {
    courier: Package,
    travel: Plane,
    food: Utensils,
    other: FileText,
  };

  const iconColors = {
    courier: 'text-blue-500',
    travel: 'text-purple-500',
    food: 'text-orange-500',
    other: 'text-slate-500',
  };

  const categoryLabels = {
    courier: 'Courier',
    travel: 'Travel',
    food: 'Food',
    other: 'Other',
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = 
      searchQuery === '' || 
      e.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.courierName && e.courierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || e.expenseType === categoryFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Track and manage business operational costs.</p>
        </div>
        <ExpenseForm />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Expense Records</CardTitle>
            <CardDescription>A detailed list of all tracked business costs and operational expenses.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="courier">Courier</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No expenses found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const Icon = categoryIcons[expense.expenseType as keyof typeof categoryIcons];
                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.expenseNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${iconColors[expense.expenseType as keyof typeof iconColors]}`} />
                            <span className="capitalize">{expense.expenseType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                          {expense.expenseType === 'courier' && expense.courierName}
                          {expense.expenseType === 'travel' && `${expense.fromLocation} to ${expense.toLocation}`}
                          {expense.expenseType === 'food' && expense.vendorName}
                          {expense.expenseType === 'other' && (expense.notes || 'General Expense')}
                        </TableCell>
                        <TableCell className="italic">
                          {getCompanyName(expense.companyId)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(expense.expenseDate)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={expense.status === 'approved' ? 'secondary' : 'default'}
                            className={
                              expense.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                            }
                          >
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(expense.totalExpense)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ExpenseForm initialExpense={expense} />
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
