'use client';

import { useData } from '@/lib/data-context';
import { PaymentForm } from '@/components/payment-form';
import { formatCurrency, formatDate } from '@/lib/format';
import { calculateDueDate, isOverdue, getDaysOverdue, getRemainingBalance } from '@/lib/calculations';
import { AlertCircle, CheckCircle, Clock, CalendarDays, Receipt, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentEditFormProps {
  payment: any;
  onSave: (payment: any) => void;
  onCancel: () => void;
}

function PaymentEditForm({ payment, onSave, onCancel }: PaymentEditFormProps) {
  const { transactions, companies } = useData();
  const [formData, setFormData] = useState({
    amount: payment.amount.toString(),
    paymentDate: payment.paymentDate,
    paymentMode: payment.paymentMode,
    referenceNumber: payment.referenceNumber || '',
    notes: payment.notes || '',
    status: payment.status || 'completed',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...payment,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMode: formData.paymentMode,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="editAmount">Amount *</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
            <Input
              id="editAmount"
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="pl-7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editDate">Payment Date *</Label>
          <Input
            id="editDate"
            type="date"
            required
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="editMode">Payment Mode</Label>
          <Select
            value={formData.paymentMode}
            onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
          >
            <SelectTrigger id="editMode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="neft">NEFT</SelectItem>
              <SelectItem value="rtgs">RTGS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editStatus">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger id="editStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="editRef">Reference Number</Label>
        <Input
          id="editRef"
          value={formData.referenceNumber}
          onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
          placeholder="Enter reference number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="editNotes">Notes</Label>
        <Input
          id="editNotes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
}

export default function PaymentsPage() {
  const { transactions, companies, payments, isLoaded, updatePayment, deletePayment } = useData();
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<any | null>(null);

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

  const getTransaction = (transactionId: string) => {
    return transactions.find((t) => t.id === transactionId);
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

  const handleUpdatePayment = (payment: any) => {
    updatePayment(payment);
    setEditingPayment(null);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId);
    setDeletingPayment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payments & Ageing</h1>
          <p className="text-sm text-muted-foreground">Track outstanding serials and payment collection status.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPaymentHistory(!showPaymentHistory)}
          >
            <Receipt className="w-4 h-4 mr-2" />
            {showPaymentHistory ? 'Hide' : 'View'} Payment History
          </Button>
          <PaymentForm />
        </div>
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
              {transactionsWithBalances.length} serials
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
                  <CardTitle className="text-sm font-bold">Overdue Serials</CardTitle>
                  <CardDescription className="text-[10px]">Exceeded payment terms.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Delay</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueTransactions.map((item) => (
                    <TableRow key={item.transaction.id}>
                      <TableCell className="font-medium text-red-700">{item.transaction.serialNumber}</TableCell>
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
                    <TableHead>Serial</TableHead>
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
                        <TableCell className="font-medium">{item.transaction.serialNumber}</TableCell>
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
              <p className="text-[10px] text-muted-foreground">No outstanding serials at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showPaymentHistory && (
        <Card className="mt-6">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold">Payment History</CardTitle>
                <CardDescription className="text-[10px]">All recorded payments.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No payments recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments
                    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                    .map((payment) => {
                      const transaction = getTransaction(payment.linkedTransactionId || '');
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="text-muted-foreground">{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell className="font-medium">{transaction?.serialNumber || '-'}</TableCell>
                          <TableCell>{getCompany(payment.companyId)?.name || payment.companyName || '-'}</TableCell>
                          <TableCell className="capitalize">{payment.paymentMode.replace('_', ' ')}</TableCell>
                          <TableCell className="text-muted-foreground">{payment.referenceNumber || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status || 'completed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingPayment(payment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => setDeletingPayment(payment)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <PaymentEditForm
              payment={editingPayment}
              onSave={handleUpdatePayment}
              onCancel={() => setEditingPayment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPayment} onOpenChange={(open) => !open && setDeletingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this payment of <span className="font-bold">{formatCurrency(deletingPayment?.amount || 0)}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPayment(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deletingPayment && handleDeletePayment(deletingPayment.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
