'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/lib/data-context';
import { Return } from '@/lib/types';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReturnFormProps {
  initialReturn?: Return;
  onSubmit?: (ret: Return) => void;
  transactionType?: 'sales' | 'purchase';
}

export function ReturnForm({ initialReturn, onSubmit, transactionType = 'sales' }: ReturnFormProps) {
  const { transactions, companies, products, addReturn, updateReturn } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Return>>(
    initialReturn || {
      type: transactionType,
      status: 'pending',
      amount: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
    }
  );

  const getRelatedTransactions = () => {
    return transactions.filter((t) => t.type === formData.type);
  };

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const getTransactionInfo = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    return transaction ? `${transaction.invoiceNumber} - ${getCompanyName(transaction.companyId)}` : '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.transactionId || !formData.amount || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const transaction = transactions.find((t) => t.id === formData.transactionId);
    if (!transaction) {
      alert('Invalid transaction selected');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const returnData: Return = {
        id: initialReturn?.id || `r${Date.now()}`,
        transactionId: formData.transactionId!,
        productId: formData.productId,
        quantity: formData.quantity || 0,
        type: formData.type as 'sales' | 'purchase',
        companyId: transaction.companyId,
        amount: formData.amount!,
        date: formData.date || new Date().toISOString().split('T')[0],
        reason: formData.reason!,
        invoiceNumber: initialReturn?.invoiceNumber || `RET-${Date.now().toString().slice(-6)}`,
        status: formData.status as 'pending' | 'approved' | 'rejected',
      };

      if (initialReturn) {
        updateReturn(returnData);
      } else {
        addReturn(returnData);
      }

      setIsLoading(false);
      setIsOpen(false);
      onSubmit?.(returnData);
      if (!initialReturn) {
        setFormData({ type: transactionType, status: 'pending', amount: 0, date: new Date().toISOString().split('T')[0] });
      }
    }, 500);
  };

  const relatedTransactions = getRelatedTransactions();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {initialReturn ? (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
            Edit
          </Button>
        ) : (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Return
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {initialReturn ? 'Edit Return' : 'Record New Return'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Return Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as 'sales' | 'purchase', transactionId: undefined })}
                    disabled={!!initialReturn}
                  >
                    <SelectTrigger id="type" className="bg-background/50">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Return</SelectItem>
                      <SelectItem value="purchase">Purchase Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction">Original Transaction *</Label>
                  <Select
                    value={formData.transactionId || ''}
                    onValueChange={(value) => setFormData({ ...formData, transactionId: value, amount: 0 })}
                  >
                    <SelectTrigger id="transaction" className="bg-background/50">
                      <SelectValue placeholder="Select transaction..." />
                    </SelectTrigger>
                    <SelectContent>
                      {relatedTransactions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {getTransactionInfo(t.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productId">Return Product (Inventory)</Label>
                  <Select
                    value={formData.productId || ''}
                    onValueChange={(value) => {
                      const product = products.find(p => p.id === value);
                      const transaction = transactions.find(t => t.id === formData.transactionId);
                      
                      if (product && transaction) {
                        // Try to auto-calc based on transaction price if possible
                        // But usually we just take the item price or manual
                        setFormData({ ...formData, productId: value });
                      } else {
                        setFormData({ ...formData, productId: value });
                      }
                    }}
                  >
                    <SelectTrigger id="productId" className="bg-background/50">
                      <SelectValue placeholder="Select returned product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Return Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || ''}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 0;
                      const product = products.find(p => p.id === formData.productId);
                      if (product) {
                         setFormData({ ...formData, quantity: qty, amount: product.price * qty });
                      } else {
                         setFormData({ ...formData, quantity: qty });
                      }
                    }}
                    placeholder="0"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Return Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="pl-7 bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Return Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'pending'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as 'pending' | 'approved' | 'rejected' })
                    }
                  >
                    <SelectTrigger id="status" className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Return *</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe why the items are being returned..."
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="resize-none bg-background/50"
                />
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
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto shadow-sm">
              {isLoading ? 'Saving...' : initialReturn ? 'Update Return' : 'Record Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
