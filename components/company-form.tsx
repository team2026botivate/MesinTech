'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Building2, User, Phone, Mail, MapPin, CreditCard, Truck } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CompanyFormProps {
  onClose?: () => void;
  defaultType?: 'customer' | 'supplier';
}

export function CompanyForm({ onClose, defaultType = 'customer' }: CompanyFormProps) {
  const { addCompany, products } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: defaultType,
    contactPerson: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    pan: '',
    paymentTermsDays: '30',
    creditLimit: '',
    preferredDispatchMethod: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    notes: '',
    status: 'active' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter company name');
      return;
    }

    const newCompany: Company = {
      id: `c${Date.now()}`,
      name: formData.name,
      type: formData.type,
      contactPerson: formData.contactPerson || undefined,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      pincode: formData.pincode || undefined,
      gstin: formData.gstin || undefined,
      pan: formData.pan || undefined,
      paymentTermsDays: parseInt(formData.paymentTermsDays) || 30,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
      preferredDispatchMethod: formData.preferredDispatchMethod || undefined,
      bankDetails: formData.bankName ? {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        branch: formData.branch,
      } : undefined,
      notes: formData.notes || undefined,
      status: formData.status,
    };

    addCompany(newCompany);
    setFormData({
      name: '',
      type: defaultType,
      contactPerson: '',
      phone: '',
      alternatePhone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstin: '',
      pan: '',
      paymentTermsDays: '30',
      creditLimit: '',
      preferredDispatchMethod: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      branch: '',
      notes: '',
      status: 'active',
    });
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New {defaultType === 'customer' ? 'Customer' : 'Supplier'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Add New {defaultType === 'customer' ? 'Customer' : 'Supplier'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="tax">Tax & Payment</TabsTrigger>
                <TabsTrigger value="bank">Bank Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {defaultType === 'customer' ? 'Customer' : 'Company'} Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g., Acme Corp"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      type="text"
                      placeholder="Primary contact name"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Entity Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as 'customer' | 'supplier' })}
                    >
                      <SelectTrigger id="type" className="bg-background/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                    <Select
                      value={formData.paymentTermsDays}
                      onValueChange={(value) => setFormData({ ...formData, paymentTermsDays: value })}
                    >
                      <SelectTrigger id="paymentTermsDays" className="bg-background/50">
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Cash on Delivery</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="15">15 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="45">45 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {defaultType === 'customer' && (
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        min="0"
                        placeholder="e.g. 50000"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                  )}

                  {defaultType === 'customer' && (
                    <div className="space-y-2">
                      <Label htmlFor="preferredDispatchMethod">Preferred Dispatch Method</Label>
                      <Select
                        value={formData.preferredDispatchMethod}
                        onValueChange={(value) => setFormData({ ...formData, preferredDispatchMethod: value })}
                      >
                        <SelectTrigger id="preferredDispatchMethod" className="bg-background/50">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Courier</SelectItem>
                          <SelectItem value="express">Express Delivery</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="self">Self Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes / Internal Remarks</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-background/50 min-h-[80px]"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone">Alternate Phone</Label>
                    <Input
                      id="alternatePhone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="billing@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="123456"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tax" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN {defaultType === 'customer' ? '(for B2B)' : ''}</Label>
                    <Input
                      id="gstin"
                      type="text"
                      placeholder="29ABCDE1234F1Z5"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input
                      id="pan"
                      type="text"
                      placeholder="ABCDE1234F"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bank" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      placeholder="1234567890"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input
                      id="ifsc"
                      type="text"
                      placeholder="HDFC0001234"
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      type="text"
                      placeholder="Branch name"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
              Create {defaultType === 'customer' ? 'Customer' : 'Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}