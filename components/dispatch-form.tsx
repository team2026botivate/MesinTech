'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Dispatch } from '@/lib/types';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DispatchForm() {
  const { addDispatch, transactions } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    transactionId: '',
    date: new Date().toISOString().split('T')[0],
    dispatcherName: '',
    trackingNumber: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    status: 'pending' as Dispatch['status'],
    notes: '',
  });

  const salesTransactions = transactions.filter((t) => t.type === 'sale');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.transactionId || !formData.dispatcherName) {
      alert('Transaction and Courier/Dispatcher name are required.');
      return;
    }

    const newDispatch: Dispatch = {
      id: `d${Date.now()}`,
      dispatchNumber: `DSP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      transactionId: formData.transactionId,
      date: formData.date,
      dispatcherName: formData.dispatcherName,
      trackingNumber: formData.trackingNumber,
      vehicleNumber: formData.vehicleNumber,
      driverName: formData.driverName,
      driverPhone: formData.driverPhone,
      status: formData.status,
      notes: formData.notes,
    };

    addDispatch(newDispatch);
    setFormData({
      transactionId: '',
      date: new Date().toISOString().split('T')[0],
      dispatcherName: '',
      trackingNumber: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      status: 'pending',
      notes: '',
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Dispatch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">Create Dispatch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label htmlFor="transactionId">Linked Sale (Invoice) *</Label>
                <Select
                  value={formData.transactionId}
                  onValueChange={(val) => setFormData({ ...formData, transactionId: val })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select sale to dispatch" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesTransactions.map((sale) => (
                      <SelectItem key={sale.id} value={sale.id}>
                        {sale.invoiceNumber} — {(sale.totalAmount || sale.amount || 0).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Dispatch Date *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispatcherName">Courier / Transport Name *</Label>
                <Input
                  id="dispatcherName"
                  type="text"
                  required
                  placeholder="FastTrack Logistics"
                  value={formData.dispatcherName}
                  onChange={(e) => setFormData({ ...formData, dispatcherName: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking / Docket No.</Label>
                <Input
                  id="trackingNumber"
                  type="text"
                  placeholder="e.g. AWB123456"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  placeholder="e.g. MH12AB3456"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as Dispatch['status'] })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverPhone">Driver Phone</Label>
                <Input
                  id="driverPhone"
                  type="tel"
                  placeholder="+1-555-0000"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes">Notes / Remarks</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Special instructions or delivery notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-background/50"
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
            <Button type="submit" className="w-full sm:w-auto shadow-sm">
              Create Dispatch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
