'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Return, LineItem } from '@/lib/types';
import { Plus, Trash2, Save, Calculator, Search, Check, ChevronsUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ReturnFormProps {
  initialReturn?: Return;
  onSubmit?: (ret: Return) => void;
  defaultReturnType?: 'sales' | 'purchase';
}

const generateReturnNumber = (type: 'sales' | 'purchase') => {
  const year = new Date().getFullYear();
  const prefix = type === 'sales' ? 'SR' : 'PR';
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${randomNum}`;
};

export function ReturnForm({ initialReturn, onSubmit, defaultReturnType = 'sales' }: ReturnFormProps) {
  const { transactions, companies, products, addReturn, updateReturn } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [billSearchError, setBillSearchError] = useState('');
  const [isTxPopoverOpen, setIsTxPopoverOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Return>>(
    initialReturn || {
      returnType: defaultReturnType,
      returnDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      refundAmount: 0,
      restockToInventory: true,
    }
  );

  const [returnItems, setReturnItems] = useState<LineItem[]>(
    initialReturn?.lineItems || [
      { id: '1', productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 0, lineTotal: 0 }
    ]
  );

  const getRelatedTransactions = useMemo(() => {
    const isSaleReturn = formData.returnType === 'sales';
    return transactions.filter((t) => isSaleReturn ? t.type === 'sale' : t.type === 'purchase');
  }, [formData.returnType, transactions]);

  const handleTransactionSelect = (transactionId: string) => {
    setFormData({ ...formData, originalTransactionId: transactionId });
    setBillSearchError('');
    setIsTxPopoverOpen(false);
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      const mappedItems: LineItem[] = (transaction.lineItems || []).map((item) => ({
        ...item,
        id: `return-${item.id}-${Date.now()}`,
        quantity: item.quantity,
        lineTotal: item.quantity * item.unitPrice,
      }));
      setReturnItems(mappedItems);
    }
  };

  const selectedTransaction = useMemo(() => {
    return transactions.find(t => t.id === formData.originalTransactionId);
  }, [formData.originalTransactionId, transactions]);

  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === (selectedTransaction?.companyId || formData.companyId));
  }, [selectedTransaction, formData.companyId, companies]);

  const calculateRefundAmount = useMemo(() => {
    return returnItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [returnItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.originalTransactionId || !formData.returnReason) {
      toast.error('Please select an original transaction and a return reason');
      return;
    }

    setIsLoading(true);
    
    const returnData: Return = {
      id: initialReturn?.id || `r${Date.now()}`,
      returnNumber: formData.returnNumber || generateReturnNumber(formData.returnType || 'sales'),
      returnType: formData.returnType || defaultReturnType,
      type: formData.returnType === 'sales' ? 'sale' : 'purchase',
      originalTransactionId: formData.originalTransactionId!,
      originalSerialNumber: selectedTransaction?.serialNumber,
      companyId: selectedTransaction?.companyId || '',
      companyName: selectedCompany?.name,
      returnDate: formData.returnDate || new Date().toISOString().split('T')[0],
      lineItems: returnItems,
      returnReason: formData.returnReason!,
      refundType: formData.refundType as 'cash_refund' | 'credit_note' | 'exchange',
      debitNoteAmount: formData.debitNoteAmount,
      refundAmount: calculateRefundAmount,
      restockToInventory: formData.restockToInventory,
      stockDeducted: formData.stockDeducted,
      cashReturnAmount: formData.cashReturnAmount,
      cashReturnMode: formData.cashReturnMode,
      cashReturnRef: formData.cashReturnRef,
      cashReturnDate: formData.cashReturnDate,
      cashReturnNotes: formData.cashReturnNotes,
      status: formData.status as 'pending' | 'approved' | 'rejected',
      notes: formData.notes,
    };

    if (initialReturn) {
      updateReturn(returnData);
    } else {
      addReturn(returnData);
    }

    toast.success(`Return ${initialReturn ? 'updated' : 'recorded'} successfully`);
    setIsLoading(false);
    setIsOpen(false);
    onSubmit?.(returnData);
    
    if (!initialReturn) {
      setFormData({
        returnType: defaultReturnType,
        returnDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        refundAmount: 0,
        restockToInventory: true,
      });
      setReturnItems([{ id: '1', productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 0, lineTotal: 0 }]);
    }
  };

  const addReturnItem = () => {
    setReturnItems([
      ...returnItems,
      { id: Date.now().toString(), productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 0, lineTotal: 0 }
    ]);
  };

  const removeReturnItem = (id: string) => {
    if (returnItems.length === 1) return;
    setReturnItems(returnItems.filter(item => item.id !== id));
  };

  const updateReturnItem = (id: string, updates: Partial<LineItem>) => {
    setReturnItems(returnItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if (updates.productId) {
          const product = products.find(p => p.id === updates.productId);
          if (product) {
            updated.description = product.name;
            updated.unitPrice = product.sellingPrice;
            updated.gstRate = product.gstRate;
            updated.unit = product.unit;
          }
        }
        updated.lineTotal = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {initialReturn ? (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/10">
            Edit
          </Button>
        ) : (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Return
          </Button>
        )}
      </DialogTrigger>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {initialReturn ? 'Edit Return RECORD' : `Create ${formData.returnType === 'sales' ? 'Sales' : 'Purchase'} Return`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Fill out the form below to process a return for a sale or purchase transaction.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              
              {/* Section 1: Top - Return Type & Bill Number */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Enter Bill Number</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="returnType" className="text-sm font-medium">Return Type <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.returnType || defaultReturnType}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        returnType: value as 'sales' | 'purchase',
                        originalTransactionId: undefined 
                      })}
                      disabled={!!initialReturn}
                    >
                      <SelectTrigger id="returnType" className="bg-background/50 border-muted-foreground/20 h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Return (Customer)</SelectItem>
                        <SelectItem value="purchase">Purchase Return (Supplier)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="originalTransaction" className="text-sm font-medium">Search & Select Transaction <span className="text-destructive">*</span></Label>
                    <Popover open={isTxPopoverOpen} onOpenChange={setIsTxPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="originalTransaction"
                          variant="outline"
                          role="combobox"
                          aria-expanded={isTxPopoverOpen}
                          disabled={!!initialReturn}
                          className="w-full justify-between bg-background/50 border-muted-foreground/20 h-12 text-left font-normal"
                        >
                          {selectedTransaction
                            ? `${selectedTransaction.serialNumber} - ${companies.find(c => c.id === selectedTransaction.companyId)?.name}`
                            : "Search by Bill Number or Entity name..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-2xl border-primary/10" align="start">
                        <Command className="rounded-xl">
                          <CommandInput 
                            placeholder="Type Bill Number or Entity name..." 
                            className="h-12 border-none focus:ring-0"
                          />
                          <CommandList 
                            className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain"
                            onWheel={(e) => e.stopPropagation()}
                          >
                            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground italic">
                              No matching transaction found.
                            </CommandEmpty>
                            <CommandGroup heading={formData.returnType === 'sales' ? 'Recent Sales Invoices' : 'Recent Purchase Bills'}>
                            {getRelatedTransactions.map((t) => (
                              <CommandItem
                                key={t.id}
                                value={`${t.serialNumber} ${companies.find(c => c.id === t.companyId)?.name}`}
                                onSelect={() => handleTransactionSelect(t.id)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all",
                                  formData.originalTransactionId === t.id ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "flex items-center justify-center h-8 w-8 rounded-full shrink-0",
                                  formData.originalTransactionId === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                  <Check className={cn("h-4 w-4", formData.originalTransactionId === t.id ? "opacity-100" : "opacity-20")} />
                                </div>
                                <div className="flex items-center justify-between w-full min-w-0">
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-foreground truncate">{t.serialNumber}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight truncate">
                                      {companies.find(c => c.id === t.companyId)?.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0 ml-4">
                                    <span className="text-sm font-black text-foreground">{formatCurrency(t.totalAmount || t.amount)}</span>
                                    <span className="text-[10px] text-muted-foreground italic">{t.date}</span>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {billSearchError && <p className="text-xs text-destructive mt-1">{billSearchError}</p>}
                </div>
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Section 2: Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Basic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="returnNumber" className="text-sm font-medium">Return ID</Label>
                    <Input
                      id="returnNumber"
                      readOnly
                      value={formData.returnNumber || generateReturnNumber(formData.returnType || 'sales')}
                      onChange={(e) => setFormData({ ...formData, returnNumber: e.target.value })}
                      className="bg-background/20 border-muted-foreground/20 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnDate" className="text-sm font-medium">Return Date <span className="text-destructive">*</span></Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="bg-background/50 border-muted-foreground/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                    <Select
                      value={formData.status || 'pending'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as 'pending' | 'approved' | 'rejected' })
                      }
                    >
                      <SelectTrigger id="status" className="bg-background/50 border-muted-foreground/20">
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
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Reference</h3>
                </div>
                <div className="space-y-4 p-4 rounded-xl border border-muted-foreground/10 bg-muted/5 min-h-[140px] flex flex-col justify-center">
                  {selectedTransaction ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Linked To</p>
                      <p className="text-xs text-muted-foreground">Serial: {selectedTransaction.serialNumber}</p>
                      <p className="text-xs text-muted-foreground">Original Total: {formatCurrency(selectedTransaction.totalAmount || selectedTransaction.amount)}</p>
                      <Badge variant="outline" className="mt-2 bg-background/50">
                        {selectedTransaction.date}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <p className="text-xs text-muted-foreground italic">No transaction selected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Section 2: Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Return Items</h3>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addReturnItem}
                  className="rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary px-4"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Item
                </Button>
              </div>

              <div className="border border-muted-foreground/10 rounded-2xl overflow-hidden shadow-sm bg-background">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[45%] font-bold text-xs uppercase tracking-wider h-10">Product / Description</TableHead>
                      <TableHead className="text-right w-[10%] font-bold text-xs uppercase tracking-wider h-10">Qty</TableHead>
                      <TableHead className="w-[10%] font-bold text-xs uppercase tracking-wider h-10">Unit</TableHead>
                      <TableHead className="text-right w-[15%] font-bold text-xs uppercase tracking-wider h-10">Rate</TableHead>
                      <TableHead className="text-right w-[15%] font-bold text-xs uppercase tracking-wider h-10">Total</TableHead>
                      <TableHead className="w-[5%] h-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/10 border-muted-foreground/5 h-12">
                        <TableCell className="py-2">
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateReturnItem(item.id, { productId: value })}
                          >
                            <SelectTrigger className="bg-background border-muted-foreground/20 hover:bg-muted/10 transition-colors h-8">
                              <SelectValue placeholder="Search product..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} ({p.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateReturnItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            className="text-right bg-background border-muted-foreground/20 h-8 font-medium"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateReturnItem(item.id, { unit: value })}
                          >
                            <SelectTrigger className="bg-background border-muted-foreground/20 w-full h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pcs">pcs</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="ltr">ltr</SelectItem>
                              <SelectItem value="box">box</SelectItem>
                              <SelectItem value="set">set</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateReturnItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="text-right bg-background border-muted-foreground/20 h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold py-2">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReturnItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Section 3: Reason & Resolution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Reason & Notes</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="returnReason" className="text-sm font-medium">Return Reason <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.returnReason}
                        onValueChange={(value) => setFormData({ ...formData, returnReason: value })}
                      >
                        <SelectTrigger id="returnReason" className="bg-background/50 border-muted-foreground/20">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="damaged">Damaged Item</SelectItem>
                          <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                          <SelectItem value="quality_issue">Quality Issue</SelectItem>
                          <SelectItem value="customer_cancelled">Customer Cancelled</SelectItem>
                          <SelectItem value="defective">Defective Product</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Internal Notes</Label>
                      <Textarea
                        id="notes"
                        rows={4}
                        placeholder="Additional details about the return..."
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-background/50 border-muted-foreground/20 resize-none rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-4 p-5 rounded-2xl border-2 border-orange-100 bg-orange-50/50">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-orange-500 rounded-full" />
                      <h3 className="text-sm font-bold text-orange-700 uppercase tracking-tight">Cash Return Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cashReturnAmount" className="text-sm font-medium">Cash Return Amount</Label>
                        <Input
                          id="cashReturnAmount"
                          type="number"
                          placeholder="Enter cash amount"
                          value={formData.cashReturnAmount || ''}
                          onChange={(e) => setFormData({ ...formData, cashReturnAmount: parseFloat(e.target.value) || 0 })}
                          className="bg-background border-muted-foreground/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cashReturnMode" className="text-sm font-medium">Payment Mode</Label>
                        <Select
                          value={formData.cashReturnMode}
                          onValueChange={(value) => setFormData({ ...formData, cashReturnMode: value })}
                        >
                          <SelectTrigger id="cashReturnMode" className="bg-background border-muted-foreground/20">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cashReturnRef" className="text-sm font-medium">Reference Number</Label>
                        <Input
                          id="cashReturnRef"
                          placeholder="Ref/cheque number"
                          value={formData.cashReturnRef || ''}
                          onChange={(e) => setFormData({ ...formData, cashReturnRef: e.target.value })}
                          className="bg-background border-muted-foreground/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cashReturnDate" className="text-sm font-medium">Date</Label>
                        <Input
                          id="cashReturnDate"
                          type="date"
                          value={formData.cashReturnDate || ''}
                          onChange={(e) => setFormData({ ...formData, cashReturnDate: e.target.value })}
                          className="bg-background border-muted-foreground/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cashReturnNotes" className="text-sm font-medium">Notes</Label>
                      <Textarea
                        id="cashReturnNotes"
                        rows={2}
                        placeholder="Additional notes..."
                        value={formData.cashReturnNotes || ''}
                        onChange={(e) => setFormData({ ...formData, cashReturnNotes: e.target.value })}
                        className="bg-background border-muted-foreground/20 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-5 rounded-2xl border border-muted-foreground/10 bg-muted/5">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-primary rounded-full" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Inventory</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background border border-muted-foreground/10 rounded-xl">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold">Restock to Inventory</Label>
                          <p className="text-[10px] text-muted-foreground tracking-tight">Add items back to available stock</p>
                        </div>
                        <Switch
                          checked={formData.restockToInventory || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, restockToInventory: checked })}
                        />
                      </div>

                      {formData.returnType === 'purchase' && (
                        <div className="flex items-center justify-between p-3 bg-background border border-muted-foreground/10 rounded-xl">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Deduct from Inventory</Label>
                            <p className="text-[10px] text-muted-foreground tracking-tight">Remove returned items from available stock</p>
                          </div>
                          <Switch
                            checked={formData.stockDeducted || false}
                            onCheckedChange={(checked) => setFormData({ ...formData, stockDeducted: checked })}
                          />
                        </div>
                      )}

                      {formData.returnType === 'purchase' && (
                        <div className="flex items-center justify-between p-3 bg-background border border-muted-foreground/10 rounded-xl">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Debit Note Amount</Label>
                            <p className="text-[10px] text-muted-foreground tracking-tight">Amount to deduct from supplier payable</p>
                          </div>
                          <Input
                            type="number"
                            className="w-24 h-8 text-right font-bold"
                            value={formData.debitNoteAmount || 0}
                            onChange={(e) => setFormData({ ...formData, debitNoteAmount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Return Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Return Value</span>
                      <span className="font-bold text-foreground">{formatCurrency(calculateRefundAmount)}</span>
                    </div>
                    
                    <div className="h-px bg-primary/10 my-2" />
                    
                    <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg shadow-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-black opacity-80 tracking-widest">Total Refund</span>
                        <span className="text-2xl font-black">{formatCurrency(calculateRefundAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-muted/10 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="shadow-md px-8">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {initialReturn ? 'Update Return' : 'Record Return'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}