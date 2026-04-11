'use client';

import React, { useState } from 'react';
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
import { Expense } from '@/lib/types';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit?: (expense: Expense) => void;
}

const generateExpenseNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `EXP-${year}-${randomNum}`;
};

export function ExpenseForm({ initialExpense, onSubmit }: ExpenseFormProps) {
  const { companies, transactions, addExpense, updateExpense } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>(
    initialExpense || {
      expenseType: 'other' as const,
      expenseNumber: generateExpenseNumber(),
      expenseDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      amount: 0,
      totalExpense: 0,
    }
  );

  const calculateTotal = () => {
    if (formData.expenseType === 'courier') {
      return formData.courierAmount || 0;
    }
    if (formData.expenseType === 'travel') {
      return (formData.travelAmount || 0) + (formData.tollParkingAmount || 0);
    }
    if (formData.expenseType === 'food') {
      return formData.foodAmount || 0;
    }
    return formData.amount || 0;
  };

  const currentTotal = calculateTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTotal <= 0) {
      alert('Please enter an expense amount');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const expenseData: Expense = {
        id: initialExpense?.id || `e${Date.now()}`,
        expenseNumber: formData.expenseNumber || generateExpenseNumber(),
        expenseType: formData.expenseType as 'courier' | 'travel' | 'food' | 'other',
        expenseDate: formData.expenseDate || new Date().toISOString().split('T')[0],
        linkedTransactionId: formData.linkedTransactionId,
        companyId: formData.companyId,
        totalExpense: currentTotal,
        amount: formData.amount || 0,
        courierName: formData.courierName,
        dispatcherName: formData.dispatcherName,
        itemsCount: formData.itemsCount,
        weight: formData.weight,
        courierAmount: formData.courierAmount,
        trackingNumber: formData.trackingNumber,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        travelMode: formData.travelMode,
        purposeOfTravel: formData.purposeOfTravel,
        travelAmount: formData.travelAmount,
        tollParkingAmount: formData.tollParkingAmount,
        returnTrip: formData.returnTrip,
        mealType: formData.mealType,
        numberOfPeople: formData.numberOfPeople,
        vendorName: formData.vendorName,
        foodDescription: formData.foodDescription,
        foodAmount: formData.foodAmount,
        notes: formData.notes,
        status: formData.status as 'pending' | 'approved',
      };

      if (initialExpense) {
        updateExpense(expenseData);
      } else {
        addExpense(expenseData);
      }

      setIsLoading(false);
      setIsOpen(false);
      onSubmit?.(expenseData);
      if (!initialExpense) {
        setFormData({
          expenseType: 'other',
          expenseNumber: generateExpenseNumber(),
          expenseDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          amount: 0,
          totalExpense: 0,
        });
      }
    }, 500);
  };

  const salesTransactions = transactions.filter(t => t.type === 'sale');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {initialExpense ? (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/10">
            Edit
          </Button>
        ) : (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {initialExpense ? 'Edit Expense Record' : 'Log New business Expense'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
              {/* Section 1: Basic Classification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Basic Classification</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="expenseNumber" className="text-xs font-bold uppercase opacity-70">Expense ID</Label>
                    <Input
                      id="expenseNumber"
                      readOnly
                      value={formData.expenseNumber}
                      onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                      className="bg-background/20 border-muted-foreground/20 h-10 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenseDate" className="text-xs font-bold uppercase opacity-70">Expense Date *</Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenseType" className="text-xs font-bold uppercase opacity-70">Expense Type *</Label>
                    <Select
                      value={formData.expenseType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          expenseType: value as 'courier' | 'travel' | 'food' | 'other',
                        })
                      }
                    >
                      <SelectTrigger id="expenseType" className="bg-background border-muted-foreground/20 h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="courier">Courier & Logistics</SelectItem>
                        <SelectItem value="travel">Travel & Conveyance</SelectItem>
                        <SelectItem value="food">Food & Hospitality</SelectItem>
                        <SelectItem value="other">General / Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs font-bold uppercase opacity-70">Verification Status</Label>
                    <Select
                      value={formData.status || 'pending'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as 'pending' | 'approved' })
                      }
                    >
                      <SelectTrigger id="status" className="bg-background border-muted-foreground/20 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending Approval</SelectItem>
                        <SelectItem value="approved">Approved / Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 2: Specific Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Expense Details</h3>
                </div>
                
                <div className="p-6 rounded-2xl border border-muted-foreground/10 bg-muted/5">
                  {formData.expenseType === 'courier' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="courierName" className="text-xs font-bold uppercase opacity-70">Courier Service Name *</Label>
                        <Input
                          id="courierName"
                          placeholder="DHL, FedEx, BlueDart..."
                          value={formData.courierName || ''}
                          onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dispatcherName" className="text-xs font-bold uppercase opacity-70">Dispatcher / Boy Name</Label>
                        <Input
                          id="dispatcherName"
                          placeholder="John Doe"
                          value={formData.dispatcherName || ''}
                          onChange={(e) => setFormData({ ...formData, dispatcherName: e.target.value })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trackingNumber" className="text-xs font-bold uppercase opacity-70">AWB / Tracking Number</Label>
                        <Input
                          id="trackingNumber"
                          placeholder="EX123456789"
                          value={formData.trackingNumber || ''}
                          onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="itemsCount" className="text-xs font-bold uppercase opacity-70">No. of Items</Label>
                          <Input
                            id="itemsCount"
                            type="number"
                            min="1"
                            value={formData.itemsCount || ''}
                            onChange={(e) => setFormData({ ...formData, itemsCount: parseInt(e.target.value) || undefined })}
                            className="bg-background h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight" className="text-xs font-bold uppercase opacity-70">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={formData.weight || ''}
                            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                            className="bg-background h-10"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="courierAmount" className="text-xs font-bold uppercase opacity-70 text-primary">Courier Charges (Amount) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                          <Input
                            id="courierAmount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.courierAmount || ''}
                            onChange={(e) => setFormData({ ...formData, courierAmount: parseFloat(e.target.value) || 0 })}
                            className="pl-8 bg-background border-primary/30 h-10 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.expenseType === 'travel' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fromLocation" className="text-xs font-bold uppercase opacity-70">From (Point A) *</Label>
                        <Input
                          id="fromLocation"
                          placeholder="Origin location"
                          value={formData.fromLocation || ''}
                          onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toLocation" className="text-xs font-bold uppercase opacity-70">To (Point B) *</Label>
                        <Input
                          id="toLocation"
                          placeholder="Destination"
                          value={formData.toLocation || ''}
                          onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travelMode" className="text-xs font-bold uppercase opacity-70">Mode of Conveyance</Label>
                        <Select
                          value={formData.travelMode}
                          onValueChange={(value) => setFormData({ ...formData, travelMode: value })}
                        >
                          <SelectTrigger id="travelMode" className="bg-background h-10">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="two-wheeler">Two-Wheeler</SelectItem>
                            <SelectItem value="auto">Auto Rikshaw</SelectItem>
                            <SelectItem value="taxi">Taxi / Uber / Ola</SelectItem>
                            <SelectItem value="train">Train / Metro</SelectItem>
                            <SelectItem value="bus">Public Bus</SelectItem>
                            <SelectItem value="flight">Flight</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-8">
                        <Switch
                          checked={formData.returnTrip || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, returnTrip: checked })}
                          id="returnTrip"
                        />
                        <Label htmlFor="returnTrip" className="text-sm font-medium">Round Trip Included</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="travelAmount" className="text-xs font-bold uppercase opacity-70">Base Travel Fare *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                          <Input
                            id="travelAmount"
                            type="number"
                            step="0.01"
                            value={formData.travelAmount || ''}
                            onChange={(e) => setFormData({ ...formData, travelAmount: parseFloat(e.target.value) || 0 })}
                            className="pl-8 bg-background h-10 font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tollParkingAmount" className="text-xs font-bold uppercase opacity-70">Toll & Parking Charges</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                          <Input
                            id="tollParkingAmount"
                            type="number"
                            step="0.01"
                            value={formData.tollParkingAmount || ''}
                            onChange={(e) => setFormData({ ...formData, tollParkingAmount: parseFloat(e.target.value) || 0 })}
                            className="pl-8 bg-background h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.expenseType === 'food' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="vendorName" className="text-xs font-bold uppercase opacity-70">Vendor / Restaurant Name</Label>
                        <Input
                          id="vendorName"
                          placeholder="e.g. Swiggy, Zomato, Restaurant Name"
                          value={formData.vendorName || ''}
                          onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mealType" className="text-xs font-bold uppercase opacity-70">Meal Type</Label>
                        <Select
                          value={formData.mealType}
                          onValueChange={(value) => setFormData({ ...formData, mealType: value as any })}
                        >
                          <SelectTrigger id="mealType" className="bg-background h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snacks">Snacks / Refreshments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numberOfPeople" className="text-xs font-bold uppercase opacity-70">Number of People Covered</Label>
                        <Input
                          id="numberOfPeople"
                          type="number"
                          min="1"
                          value={formData.numberOfPeople || ''}
                          onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) || undefined })}
                          className="bg-background h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foodAmount" className="text-xs font-bold uppercase opacity-70 text-primary">Bill Amount *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                          <Input
                            id="foodAmount"
                            type="number"
                            step="0.01"
                            value={formData.foodAmount || ''}
                            onChange={(e) => setFormData({ ...formData, foodAmount: parseFloat(e.target.value) || 0 })}
                            className="pl-8 bg-background border-primary/30 h-10 font-bold"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="foodDescription" className="text-xs font-bold uppercase opacity-70">Expense Description</Label>
                        <Textarea
                          id="foodDescription"
                          placeholder="Enter details about what was ordered or the occasion..."
                          value={formData.foodDescription || ''}
                          onChange={(e) => setFormData({ ...formData, foodDescription: e.target.value })}
                          className="bg-background resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {formData.expenseType === 'other' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-bold uppercase opacity-70 text-primary">Expense Amount *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            className="pl-8 bg-background border-primary/30 h-10 font-bold text-lg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-bold uppercase opacity-70">General Description / Purpose</Label>
                        <Textarea
                          id="notes"
                          placeholder="What was this expense for?"
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="bg-background resize-none"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 3: Relationship & Links */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Relationship & Links</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyId" className="text-xs font-bold uppercase opacity-70">Associated Business Entity</Label>
                    <Select
                      value={formData.companyId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, companyId: value === 'none' ? undefined : value })}
                    >
                      <SelectTrigger id="companyId" className="bg-background h-10">
                        <SelectValue placeholder="Select customer/supplier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None / House Expense</SelectItem>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedTransaction" className="text-xs font-bold uppercase opacity-70">Link to Sales Serial</Label>
                    <Select
                      value={formData.linkedTransactionId || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, linkedTransactionId: value === 'none' ? undefined : value })}
                    >
                      <SelectTrigger id="linkedTransaction" className="bg-background h-10">
                        <SelectValue placeholder="Select invoice..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {salesTransactions.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.serialNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-muted/50 p-6 rounded-2xl border border-primary/10 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-tight mb-1">Total Impact Amount</p>
                    <p className="text-3xl font-black text-primary">
                      ₹{currentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-11 px-8 rounded-xl"
            >
              Discard Changes
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="h-11 px-10 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:translate-y-[-1px] transition-all"
            >
              {isLoading ? 'Processing...' : initialExpense ? 'Update Record' : 'Log Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}