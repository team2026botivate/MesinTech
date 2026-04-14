import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '@/lib/data-context';
import { Transaction, TransactionType, LineItem, Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Tag, Percent, Calculator, FileText, Save, Eye } from 'lucide-react';
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
import { toast } from 'sonner';
import { formatCurrency, numberToWords } from '@/lib/format';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { InvoiceDialog } from '@/components/invoice-dialog';

interface TransactionFormProps {
  type: TransactionType;
  onClose?: () => void;
  editTransaction?: Transaction | null;
}

const generateSerialNumber = (type: TransactionType) => {
  const year = new Date().getFullYear();
  const prefix = 'SR';
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${randomNum}`;
};

export function TransactionForm({ type, onClose, editTransaction }: TransactionFormProps) {
  const { companies, products, addTransaction, updateTransaction } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [transferPopup, setTransferPopup] = useState<{ oldSerial: string, newSerial: string } | null>(null);
  
  const [formData, setFormData] = useState({
    companyId: '',
    date: new Date().toISOString().split('T')[0],
    serialNumber: generateSerialNumber(type),
    supplierInvoiceNumber: '',
    description: '',
    dueDate: '',
    billingAddress: '',
    discountType: 'fixed' as 'percentage' | 'fixed',
    discountValue: 0,
    paymentMethod: 'bill' as 'cash' | 'bill',
    cashSerialNumber: '',
    billSerialNumber: '',
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 18, lineTotal: 0 }
  ]);



  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === formData.companyId);
  }, [formData.companyId, companies]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    const val = parseFloat(String(formData.discountValue)) || 0;
    if (formData.discountType === 'percentage') {
      return (subtotal * val) / 100;
    }
    return val;
  }, [subtotal, formData.discountType, formData.discountValue]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const gstCalculations = useMemo(() => {
    let cgst = 0, sgst = 0, igst = 0;
    
    items.forEach(item => {
      const itemBase = (item.quantity * item.unitPrice) - (item.discount || 0);
      const itemGst = (itemBase * item.gstRate) / 100;
      
      // Defaulting to Local GST (CGST + SGST)
      cgst += itemGst / 2;
      sgst += itemGst / 2;
    });
    
    return { cgst, sgst, igst, totalGst: cgst + sgst + igst };
  }, [items]);

  const totalAmount = useMemo(() => {
    return taxableAmount + gstCalculations.totalGst;
  }, [taxableAmount, gstCalculations]);

  const amountInWords = useMemo(() => {
    return numberToWords(totalAmount);
  }, [totalAmount]);

  useEffect(() => {
    if (selectedCompany) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + selectedCompany.paymentTermsDays);
      setFormData(prev => ({
        ...prev,
        billingAddress: selectedCompany.address || '',
        dueDate: dueDate.toISOString().split('T')[0],
      }));
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        companyId: editTransaction.companyId || '',
        date: editTransaction.date || new Date().toISOString().split('T')[0],
        serialNumber: editTransaction.serialNumber || generateSerialNumber(type),
        supplierInvoiceNumber: editTransaction.supplierInvoiceNumber || '',
        description: editTransaction.description || '',
        dueDate: editTransaction.dueDate || '',
        billingAddress: editTransaction.billingAddress || '',
        discountType: editTransaction.discountType || 'fixed',
        discountValue: editTransaction.discountValue || 0,
        paymentMethod: editTransaction.paymentMethod || 'bill',
        cashSerialNumber: editTransaction.cashSerialNumber || '',
        billSerialNumber: editTransaction.billSerialNumber || '',
      });
      setItems(editTransaction.lineItems || [{ id: '1', productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 18, lineTotal: 0 }]);
    } else {
      setFormData(prev => ({
        ...prev,
        serialNumber: generateSerialNumber(type),
        paymentMethod: 'bill',
        cashSerialNumber: '',
        billSerialNumber: '',
      }));
      setItems([{ id: '1', productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 18, lineTotal: 0 }]);
    }
  }, [editTransaction, type]);

  useEffect(() => {
    if (editTransaction) {
      setIsOpen(true);
    }
  }, [editTransaction]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 18, lineTotal: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        if (updates.productId) {
          const product = products.find(p => p.id === updates.productId);
          if (product) {
            updatedItem.unitPrice = product.sellingPrice;
            updatedItem.description = product.name;
            updatedItem.hsnCode = product.hsnCode || '';
            updatedItem.gstRate = product.gstRate;
            updatedItem.unit = product.unit;
          }
        }
        const baseAmount = updatedItem.quantity * updatedItem.unitPrice;
        const discount = updatedItem.discount || 0;
        updatedItem.lineTotal = baseAmount - discount;
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent, action: 'save' | 'transfer' = 'save') => {
    e.preventDefault();

    if (!formData.companyId) {
      toast.error(`Please select a ${type === 'sale' ? 'customer' : 'supplier'}`);
      return;
    }

    const invalidItems = items.filter(item => !item.productId && !item.description);
    if (invalidItems.length > 0) {
      toast.error('Each item must have a product or description');
      return;
    }

    const finalItems = items.map(item => ({
      ...item,
      cgst: item.gstRate / 2,
      sgst: item.gstRate / 2,
      igst: 0,
    }));

    const transactionData: Transaction = {
      id: editTransaction ? editTransaction.id : `t${Date.now()}`,
      type,
      serialNumber: formData.serialNumber,
      supplierInvoiceNumber: formData.supplierInvoiceNumber || undefined,
      companyId: formData.companyId,
      companyName: selectedCompany?.name,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.billingAddress,
      placeOfSupply: selectedCompany?.state,
      lineItems: finalItems,
      subtotal,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      discountAmount,
      taxableAmount,
      cgstAmount: gstCalculations.cgst,
      sgstAmount: gstCalculations.sgst,
      igstAmount: gstCalculations.igst,
      totalGst: gstCalculations.totalGst,
      totalAmount,
      amountPaid: editTransaction ? editTransaction.amountPaid : 0,
      balanceDue: editTransaction ? editTransaction.balanceDue : totalAmount,
      amountInWords,
      date: formData.date,
      dueDate: formData.dueDate,
      paymentStatus: editTransaction ? editTransaction.paymentStatus : 'pending',
      notes: formData.description || undefined,
      status: 'confirmed',
      paymentMethod: formData.paymentMethod,
      cashSerialNumber: formData.paymentMethod === 'cash' ? formData.cashSerialNumber : undefined,
      billSerialNumber: formData.paymentMethod === 'bill' ? formData.billSerialNumber : undefined,
    };

    if (editTransaction) {
      if (action === 'transfer') {
        const newSerialNumber = generateSerialNumber(type);
        const oldTransactionData: Transaction = {
          ...editTransaction,
          status: 'cancelled',
          transferredTo: newSerialNumber
        };
        updateTransaction(oldTransactionData);

        const newTransactionData: Transaction = {
          ...transactionData,
          id: `t${Date.now()}`,
          serialNumber: newSerialNumber,
          transferredFrom: editTransaction.serialNumber,
          status: 'confirmed'
        };
        addTransaction(newTransactionData);
        setTransferPopup({ oldSerial: editTransaction.serialNumber, newSerial: newSerialNumber });
      } else {
        updateTransaction(transactionData);
        toast.success(`${type === 'sale' ? 'Sale' : 'Purchase'} updated successfully`);
      }
    } else {
      addTransaction(transactionData);
      toast.success(`${type === 'sale' ? 'Sale' : 'Purchase'} invoice created successfully`);
    }
    
    setFormData({
      companyId: '',
      date: new Date().toISOString().split('T')[0],
      serialNumber: generateSerialNumber(type),
      supplierInvoiceNumber: '',
      description: '',
      dueDate: '',
      billingAddress: '',
      discountType: 'fixed',
      discountValue: 0,
      paymentMethod: 'bill',
      cashSerialNumber: '',
      billSerialNumber: '',
    });
    setItems([{ id: '1', productId: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, gstRate: 18, lineTotal: 0 }]);
    
    if (action !== 'transfer') {
      setIsOpen(false);
      onClose?.();
    }
  };

  const relevantCompanies = companies.filter(
    (c) => (type === 'sale' ? c.type === 'customer' : c.type === 'supplier')
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose?.();
      }
      setIsOpen(open);
    }}>
      {!editTransaction && (
        <DialogTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New {type === 'sale' ? 'Sale' : 'Purchase'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
            {editTransaction ? `${type === 'sale' ? 'Sale' : 'Purchase'} Invoice` : `Create ${type === 'sale' ? 'Sales Serial' : 'Purchase Order'}`}
            {editTransaction?.status === 'cancelled' && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 font-bold uppercase">CANCELLED</Badge>
            )}
          </DialogTitle>
          {editTransaction?.status === 'cancelled' && editTransaction.transferredTo && (
            <div className="mt-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span>This Bill has been <strong>Cancelled and Transferred</strong> to Serial Number: <strong>{editTransaction.transferredTo}</strong>.</span>
            </div>
          )}
          {editTransaction?.transferredFrom && (
            <div className="mt-2 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>This bill was transferred from cancelled Bill Serial Number: <strong>{editTransaction.transferredFrom}</strong>.</span>
            </div>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <fieldset disabled={editTransaction?.status === 'cancelled'} className="space-y-8 border-0 p-0 m-0">
              {/* Section 1: Basic Info & Logistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Basic Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyId" className="text-sm font-medium">
                      {type === 'sale' ? 'Customer' : 'Supplier'} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                    >
                      <SelectTrigger id="companyId" className="w-full bg-background/50 border-muted-foreground/20">
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
                    <Label htmlFor="serialNumber" className="text-sm font-medium">Serial Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="serialNumber"
                      required
                      readOnly
                      placeholder="SR-2025-0001"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="bg-background/20 border-muted-foreground/20 cursor-not-allowed"
                    />
                  </div>
                  
                  {editTransaction && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Transaction Status</Label>
                      <div className="h-10 flex items-center px-3 bg-muted/30 rounded-md border border-muted-foreground/10">
                        <Badge 
                          variant="outline" 
                          className={editTransaction.status === 'cancelled' ? 'bg-gray-100 text-gray-800 border-gray-300 px-3' : 'bg-emerald-50 text-emerald-700 border-emerald-200 px-3'}
                        >
                          {editTransaction.status === 'cancelled' ? 'CANCELLED' : 'ACTIVE'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {type === 'purchase' && (
                    <div className="space-y-2">
                      <Label htmlFor="supplierInvoiceNumber" className="text-sm font-medium">Supplier Invoice No.</Label>
                      <Input
                        id="supplierInvoiceNumber"
                        placeholder="Supplier's bill number"
                        value={formData.supplierInvoiceNumber}
                        onChange={(e) => setFormData({ ...formData, supplierInvoiceNumber: e.target.value })}
                        className="bg-background/50 border-muted-foreground/20"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Billing Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-background/50 border-muted-foreground/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-sm font-medium">Payment Type</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: 'cash' | 'bill') => {
                        const prefix = value === 'cash' ? 'CSH' : 'BIL';
                        const year = new Date().getFullYear();
                        const randomNum = Math.floor(Math.random() * 9000) + 1000;
                        const newSerial = `${prefix}-${year}-${randomNum}`;
                        setFormData({ 
                          ...formData, 
                          paymentMethod: value,
                          cashSerialNumber: value === 'cash' ? newSerial : '',
                          billSerialNumber: value === 'bill' ? newSerial : '',
                        });
                      }}
                    >
                      <SelectTrigger id="paymentMethod" className="w-full bg-background/50 border-muted-foreground/20">
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bill">Bill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.paymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <Label htmlFor="cashSerialNumber" className="text-sm font-medium">Cash Serial Number</Label>
                      <Input
                        id="cashSerialNumber"
                        placeholder="CSH-2025-0001"
                        value={formData.cashSerialNumber}
                        onChange={(e) => setFormData({ ...formData, cashSerialNumber: e.target.value })}
                        className="bg-background/50 border-muted-foreground/20"
                      />
                    </div>
                  )}

                  {formData.paymentMethod === 'bill' && (
                    <div className="space-y-2">
                      <Label htmlFor="billSerialNumber" className="text-sm font-medium">Bill Serial Number</Label>
                      <Input
                        id="billSerialNumber"
                        placeholder="BIL-2025-0001"
                        value={formData.billSerialNumber}
                        onChange={(e) => setFormData({ ...formData, billSerialNumber: e.target.value })}
                        className="bg-background/50 border-muted-foreground/20"
                      />
                    </div>
                  )}

                  {type === 'sale' && formData.paymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <Label htmlFor="cashSerialNumber" className="text-sm font-medium">Cash Serial Number</Label>
                      <Input
                        id="cashSerialNumber"
                        placeholder="CSH-2025-0001"
                        value={formData.cashSerialNumber}
                        onChange={(e) => setFormData({ ...formData, cashSerialNumber: e.target.value })}
                        className="bg-background/50 border-muted-foreground/20"
                      />
                    </div>
                  )}

                  {type === 'sale' && formData.paymentMethod === 'bill' && (
                    <div className="space-y-2">
                      <Label htmlFor="billSerialNumber" className="text-sm font-medium">Bill Serial Number</Label>
                      <Input
                        id="billSerialNumber"
                        placeholder="BIL-2025-0001"
                        value={formData.billSerialNumber}
                        onChange={(e) => setFormData({ ...formData, billSerialNumber: e.target.value })}
                        className="bg-background/50 border-muted-foreground/20"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="bg-background/50 border-muted-foreground/20"
                    />
                  </div>


                </div>
              </div>

            </div>

            <Separator className="opacity-50" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Billing Address</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress" className="text-sm font-medium">Full Address</Label>
                <Textarea
                  id="billingAddress"
                  rows={2}
                  placeholder="Street, City, State, PIN..."
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  className="bg-background/50 border-muted-foreground/20 resize-none rounded-xl"
                />
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Section 3: Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Invoice Items</h3>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addItem}
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
                      <TableHead className="w-[35%] font-bold text-xs uppercase tracking-wider h-10">Product</TableHead>
                      <TableHead className="text-right w-[8%] font-bold text-xs uppercase tracking-wider h-10">Qty</TableHead>
                      <TableHead className="w-[8%] font-bold text-xs uppercase tracking-wider h-10">Unit</TableHead>
                      <TableHead className="text-right w-[10%] font-bold text-xs uppercase tracking-wider h-10">Rate</TableHead>
                      <TableHead className="text-right w-[10%] font-bold text-xs uppercase tracking-wider h-10">GST %</TableHead>
                      <TableHead className="text-right w-[11%] font-bold text-xs uppercase tracking-wider h-10">Discount</TableHead>
                      <TableHead className="text-right w-[13%] font-bold text-xs uppercase tracking-wider h-10">Amount</TableHead>
                      <TableHead className="w-[5%] h-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/10 border-muted-foreground/5 h-12">
                        <TableCell className="py-2">
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(item.id, { productId: value })}
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
                            onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            className="text-right bg-background border-muted-foreground/20 h-8"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateItem(item.id, { unit: value })}
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
                            onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="text-right bg-background border-muted-foreground/20 h-8"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={item.gstRate.toString()}
                            onValueChange={(value) => updateItem(item.id, { gstRate: parseInt(value) })}
                          >
                            <SelectTrigger className="bg-background border-muted-foreground/20 w-full h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.discount || 0}
                            onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                            className="text-right bg-background border-muted-foreground/20 h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold py-2">
                          {formatCurrency(item.quantity * item.unitPrice - (item.discount || 0))}
                        </TableCell>
                        <TableCell className="text-center py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
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

            {/* Section 4: Summary & Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Additional Info</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Notes / Internal Description</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Any additional notes..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-background/50 border-muted-foreground/20 resize-none rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Summary</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-2 border-y border-primary/10">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold uppercase text-muted-foreground">
                        Discount ({formData.discountType === 'percentage' ? 'Percentage' : 'Rupees'})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex border rounded-lg overflow-hidden h-8 bg-background shadow-sm">
                        <Button
                          type="button"
                          variant={formData.discountType === 'fixed' ? 'secondary' : 'ghost'}
                          className="h-full px-3 rounded-none text-xs font-bold"
                          onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                        >
                          ₹
                        </Button>
                        <Button
                          type="button"
                          variant={formData.discountType === 'percentage' ? 'secondary' : 'ghost'}
                          className="h-full px-3 rounded-none text-xs font-bold"
                          onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                        >
                          %
                        </Button>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-24 bg-background border-primary/20 text-right font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-muted-foreground italic">Cash Discount</span>
                    <span className="text-emerald-600 font-bold">-{formatCurrency(discountAmount)}</span>
                  </div>

                  <Separator className="bg-primary/10" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxable Amount</span>
                      <span className="font-semibold text-foreground">{formatCurrency(taxableAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total GST (CGST+SGST/IGST)</span>
                      <span className="font-semibold text-foreground">{formatCurrency(gstCalculations.totalGst)}</span>
                    </div>
                  </div>

                  <div className="h-px bg-primary/20 my-2" />
                  
                  <div className="bg-muted text-foreground rounded-2xl p-4 border border-foreground/10 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs uppercase font-black opacity-60 tracking-widest">Grand Total</span>
                      <span className="text-2xl font-black">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="text-[10px] opacity-90 italic font-medium leading-tight line-clamp-2">
                      {amountInWords}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </fieldset>
            </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-muted/10">
            {editTransaction && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInvoiceDialog(true)}
                className="mr-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                View / Print
              </Button>
            )}
            <div className="flex gap-3">
              {editTransaction && editTransaction.status !== 'cancelled' && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent, 'transfer')}
                >
                  Transfer to New Bill
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={editTransaction?.status === 'cancelled'}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="shadow-sm px-8"
                disabled={editTransaction?.status === 'cancelled'}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
      {editTransaction && (
        <InvoiceDialog
          transaction={editTransaction}
          company={selectedCompany}
          isOpen={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
        />
      )}
      
      {transferPopup && (
        <Dialog open={true} onOpenChange={() => {
          setTransferPopup(null);
          setIsOpen(false);
          onClose?.();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Successful</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-foreground">
                The bill <strong>{transferPopup.oldSerial}</strong> has been cancelled and its details have been transferred to a new serial number:
              </p>
              <p className="text-xl font-bold mt-4 text-center py-3 bg-muted rounded-lg text-primary">
                {transferPopup.newSerial}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => {
                setTransferPopup(null);
                setIsOpen(false);
                onClose?.();
              }} className="w-full sm:w-auto">
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}