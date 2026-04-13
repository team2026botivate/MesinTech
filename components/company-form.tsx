'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Company } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface CompanyFormProps {
  onClose?: () => void;
  defaultType?: 'customer' | 'supplier';
  company?: Company;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CompanyForm({ 
  onClose, 
  defaultType = 'customer', 
  company, 
  trigger,
  open: externalOpen,
  onOpenChange: setExternalOpen
}: CompanyFormProps) {
  const { addCompany, updateCompany, products } = useData();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const [formData, setFormData] = useState({
    name: company?.name || '',
    type: company?.type || defaultType,
    contactPerson: company?.contactPerson || '',
    contactPersonPhone: company?.contactPersonPhone || '',
    phone: company?.phone || '',
    alternatePhone: company?.alternatePhone || '',
    email: company?.email || '',
    address: company?.address || '',
    city: company?.city || '',
    state: company?.state || '',
    pincode: company?.pincode || '',
    gstin: company?.gstin || '',
    pan: company?.pan || '',
    paymentTermsDays: String(company?.paymentTermsDays || '30'),
    creditLimit: String(company?.creditLimit || ''),
    bankName: company?.bankDetails?.bankName || '',
    accountNumber: company?.bankDetails?.accountNumber || '',
    ifsc: company?.bankDetails?.ifsc || '',
    branch: company?.bankDetails?.branch || '',
    notes: company?.notes || '',
    status: company?.status || 'active' as const,
  });

  // Update form data when company changes
  React.useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        type: company.type,
        contactPerson: company.contactPerson || '',
        contactPersonPhone: company.contactPersonPhone || '',
        phone: company.phone,
        alternatePhone: company.alternatePhone || '',
        email: company.email || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        pincode: company.pincode || '',
        gstin: company.gstin || '',
        pan: company.pan || '',
        paymentTermsDays: String(company.paymentTermsDays || '30'),
        creditLimit: String(company.creditLimit || ''),
        bankName: company.bankDetails?.bankName || '',
        accountNumber: company.bankDetails?.accountNumber || '',
        ifsc: company.bankDetails?.ifsc || '',
        branch: company.bankDetails?.branch || '',
        notes: company.notes || '',
        status: company.status || 'active',
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter company name');
      return;
    }

    if (company) {
      const updatedCompany: Company = {
        ...company,
        name: formData.name,
        type: formData.type,
        contactPerson: formData.contactPerson || undefined,
        contactPersonPhone: formData.contactPersonPhone || undefined,
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
        bankDetails: formData.bankName ? {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          branch: formData.branch,
        } : undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      };
      updateCompany(updatedCompany);
    } else {
      const newCompany: Company = {
        id: `c${Date.now()}`,
        name: formData.name,
        type: formData.type,
        contactPerson: formData.contactPerson || undefined,
        contactPersonPhone: formData.contactPersonPhone || undefined,
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
    }

    if (!company) {
      // Clear form only on "New"
      setFormData({
        name: '',
        type: defaultType,
        contactPerson: '',
        contactPersonPhone: '',
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
        bankName: '',
        accountNumber: '',
        ifsc: '',
        branch: '',
        notes: '',
        status: 'active',
      });
    }
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New {defaultType === 'customer' ? 'Customer' : 'Supplier'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {company ? 'Edit Master Record' : `Add New ${defaultType === 'customer' ? 'Customer' : 'Supplier'}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
              {/* Section 1: Business Identity */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Business Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase opacity-70">
                      Legal {defaultType === 'customer' ? 'Customer' : 'Company'} Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g., Acme Corporation Pvt Ltd"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-xs font-bold uppercase opacity-70">Entity Classification</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as 'customer' | 'supplier' })}
                    >
                      <SelectTrigger id="type" className="bg-background border-muted-foreground/20 h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Client / Customer</SelectItem>
                        <SelectItem value="supplier">Vendor / Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-bold uppercase opacity-70">Internal Remarks / Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional context, preferred delivery times, etc..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-background border-muted-foreground/20 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 2: Contact Matrix */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Point of Contact</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-xs font-bold uppercase opacity-70">Key Contact Person</Label>
                    <Input
                      id="contactPerson"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPersonPhone" className="text-xs font-bold uppercase opacity-70">Direct extension / Mobile</Label>
                    <Input
                      id="contactPersonPhone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.contactPersonPhone}
                      onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase opacity-70">Primary Office Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="Landline or Main Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase opacity-70">Official Email Axis</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="accounts@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 4: GST & Tax Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">GST & Tax Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gstin" className="text-xs font-bold uppercase opacity-70">GSTIN Number</Label>
                    <Input
                      id="gstin"
                      type="text"
                      placeholder="e.g., 27AABCP1234A1Z1"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan" className="text-xs font-bold uppercase opacity-70">PAN Number</Label>
                    <Input
                      id="pan"
                      type="text"
                      placeholder="e.g., AABCP1234A"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTermsDays" className="text-xs font-bold uppercase opacity-70">Payment Terms (Days)</Label>
                    <Input
                      id="paymentTermsDays"
                      type="number"
                      placeholder="e.g., 30"
                      value={formData.paymentTermsDays}
                      onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditLimit" className="text-xs font-bold uppercase opacity-70">Credit Limit</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 5: Bank Details */}
              {(formData.bankName || formData.accountNumber || formData.ifsc) && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-1 bg-blue-500 rounded-full" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Bank Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-xs font-bold uppercase opacity-70">Bank Name</Label>
                      <Input
                        id="bankName"
                        type="text"
                        placeholder="e.g., HDFC Bank"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-xs font-bold uppercase opacity-70">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type="text"
                        placeholder="e.g., 1234567890"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifsc" className="text-xs font-bold uppercase opacity-70">IFSC Code</Label>
                      <Input
                        id="ifsc"
                        type="text"
                        placeholder="e.g., HDFC0001234"
                        value={formData.ifsc}
                        onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10 uppercase"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-xs font-bold uppercase opacity-70">Branch</Label>
                      <Input
                        id="branch"
                        type="text"
                        placeholder="e.g., Main Branch"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator className="opacity-50" />

              {/* Section 6: Geographic */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Geographic Presence</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold uppercase opacity-70">Registered Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Unit Number, Street and Area"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-bold uppercase opacity-70">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-xs font-bold uppercase opacity-70">State / Province</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-xs font-bold uppercase opacity-70">Pin Code</Label>
                      <Input
                        id="pincode"
                        type="text"
                        placeholder="XXXXXX"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="bg-background border-muted-foreground/20 h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-11 px-8 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-11 px-10 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:translate-y-[-1px] transition-all"
            >
              {company ? 'Update Master Record' : `Log ${formData.type === 'customer' ? 'Customer' : 'Supplier'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}