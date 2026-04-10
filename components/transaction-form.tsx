'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Transaction, TransactionType } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionFormProps {
  type: TransactionType;
  onClose?: () => void;
}

export function TransactionForm({ type, onClose }: TransactionFormProps) {
  const { companies, products, addTransaction } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    description: '',
    serialNo: '',
    quantity: '',
    discount: '',
    dispatchService: '',
    productId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyId || !formData.amount || !formData.invoiceNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      type,
      companyId: formData.companyId,
      amount: parseFloat(formData.amount),
      date: formData.date,
      invoiceNumber: formData.invoiceNumber,
      description: formData.description,
      productId: formData.productId,
      quantity: parseInt(formData.quantity) || 0,
      serialNo: formData.serialNo,
      dispatchService: formData.dispatchService,
    };

    addTransaction(newTransaction);
    setFormData({
      companyId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      description: '',
      serialNo: '',
      quantity: '',
      discount: '',
      dispatchService: '',
      productId: '',
    });
    setIsOpen(false);
    onClose?.();
  };

  const relevantCompanies = companies.filter(
    (c) => (type === 'sale' ? c.type === 'customer' : c.type === 'supplier')
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New {type === 'sale' ? 'Sale' : 'Purchase'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Create {type === 'sale' ? 'Sale' : 'Purchase'} Invoice
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Left Column: Essential Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Invoice Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyId" className="text-sm font-medium">
                        {type === 'sale' ? 'Customer' : 'Supplier'}
                      </Label>
                      <Select
                        value={formData.companyId}
                        onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                      >
                        <SelectTrigger id="companyId" className="w-full bg-background/50">
                          <SelectValue placeholder={`Select a ${type === 'sale' ? 'customer' : 'supplier'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {relevantCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        required
                        placeholder={type === 'sale' ? 'INV-001' : 'PO-001'}
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
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
                        <Label htmlFor="date">Date</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Notes / Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Enter any additional details about this invoice..."
                    className="resize-none bg-background/50"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column: Additional Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Product & Logistics
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productId">Linking Product (Inventory)</Label>
                      <Select
                        value={formData.productId}
                        onValueChange={(value) => {
                          const product = products.find(p => p.id === value);
                          if (product) {
                            setFormData({ 
                              ...formData, 
                              productId: value,
                              amount: (product.price * (parseInt(formData.quantity) || 1)).toString()
                            });
                          } else {
                            setFormData({ ...formData, productId: value });
                          }
                        }}
                      >
                        <SelectTrigger id="productId" className="bg-background/50">
                          <SelectValue placeholder="Select a product from inventory" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.code}) - Stock: {p.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground italic">Linking a product will automatically update its stock levels.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serialNo">Serial Number</Label>
                      <Input
                        id="serialNo"
                        placeholder="Product serial number..."
                        value={formData.serialNo}
                        onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={(e) => {
                            const qty = e.target.value;
                            const product = products.find(p => p.id === formData.productId);
                            if (product) {
                              setFormData({ 
                                ...formData, 
                                quantity: qty,
                                amount: (product.price * (parseInt(qty) || 0)).toString()
                              });
                            } else {
                              setFormData({ ...formData, quantity: qty });
                            }
                          }}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                          <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="pl-7 bg-background/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dispatchService">Dispatch Service</Label>
                      <Input
                        id="dispatchService"
                        placeholder="e.g., DHL, FedEx, Local Courier"
                        value={formData.dispatchService}
                        onChange={(e) => setFormData({ ...formData, dispatchService: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Summary</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${formData.amount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-emerald-600">-${formData.discount || '0.00'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span>
                      ${(parseFloat(formData.amount || '0') - parseFloat(formData.discount || '0')).toFixed(2)}
                    </span>
                  </div>
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
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
