'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Payment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/format';
import { getRemainingBalance } from '@/lib/calculations';

interface PaymentFormProps {
  transactionId?: string;
  onClose?: () => void;
}

export function PaymentForm({ transactionId, onClose }: PaymentFormProps) {
  const { transactions, companies, payments, addPayment } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    linkedTransactionId: transactionId || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const selectedTransaction = transactions.find(t => t.id === formData.linkedTransactionId);
  const company = selectedTransaction ? companies.find(c => c.id === selectedTransaction.companyId) : null;
  const remainingBalance = selectedTransaction ? getRemainingBalance(selectedTransaction, payments) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.linkedTransactionId || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const newPayment: Payment = {
      id: `p${Date.now()}`,
      linkedTransactionId: formData.linkedTransactionId,
      companyId: transactions.find(t => t.id === formData.linkedTransactionId)?.companyId || '',
      amount: parseFloat(formData.amount),
      paymentDate: formData.date,
      paymentMode: 'bank_transfer',
      paymentNumber: `PAY-REC-${Date.now()}`,
      paymentType: 'received',
      status: 'completed',
    };

    addPayment(newPayment);
    setFormData({
      linkedTransactionId: transactionId || '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsOpen(false);
    onClose?.();
  };

  const unlinkedTransactions = transactions.filter(
    (t) => !transactionId || t.id === transactionId
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Select Serial / Transaction *</Label>
                <Select
                  value={formData.linkedTransactionId}
                  onValueChange={(value) => setFormData({ ...formData, linkedTransactionId: value })}
                >
                  <SelectTrigger id="linkedTransactionId" className="bg-background/50">
                    <SelectValue placeholder="Select a transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedTransactions.map((transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {transaction.serialNumber} — {transaction.type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTransaction && (
                  <Card className="mt-4 bg-muted/30 border-muted">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Company</span>
                        <span className="text-sm text-muted-foreground">{company?.name || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Type</span>
                        <Badge variant={selectedTransaction.type === 'sale' ? 'default' : 'secondary'}>
                          {selectedTransaction.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Amount</span>
                        <span className="text-sm font-semibold">{formatCurrency(selectedTransaction.totalAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Amount Paid</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(selectedTransaction.amountPaid)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Remaining Balance</span>
                        <span className="text-sm font-bold text-primary">{formatCurrency(remainingBalance)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Date</span>
                        <span className="text-sm text-muted-foreground">{formatDate(selectedTransaction.date)}</span>
                      </div>
                      {selectedTransaction.dueDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Due Date</span>
                          <span className="text-sm text-muted-foreground">{formatDate(selectedTransaction.dueDate)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-7 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10 gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto shadow-sm">
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
