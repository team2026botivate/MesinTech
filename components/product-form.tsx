'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useData } from '@/lib/data-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: any) => void;
  onCancel: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UnitType = 'pcs' | 'kg' | 'ltr' | 'box' | 'set' | 'meter' | 'pair';

const unitOptions: UnitType[] = ['pcs', 'kg', 'ltr', 'box', 'set', 'meter', 'pair'];
const categoriesList = [
  'Hardware',
  'Software',
  'Raw Materials',
  'Machinery',
  'Tools',
  'Electronics',
  'Office Supplies',
  'Other'
];
const gstRates = [0, 5, 12, 18, 28];

export function ProductForm({ product, onSubmit, onCancel, open, onOpenChange }: ProductFormProps) {
  const { companies } = useData();
  const vendors = companies.filter(c => c.type === 'supplier');

  const [formData, setFormData] = useState({
    name: '',
    vendorId: '',
    vendorName: '',
    size: '',
    description: '',
    sellingPrice: 0,
    openingStock: 0,
    stock: 0,
    category: 'Other',
    unit: 'pcs' as UnitType,
    minStockAlert: 10,
    purchasePrice: 0,
    gstRate: 18,
    hsnCode: '',
    status: 'active' as const,
    productImage: '',
  });

  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name,
        vendorId: product.vendorId || '',
        vendorName: product.vendorName || '',
        size: product.size || '',
        description: product.description || '',
        sellingPrice: product.sellingPrice,
        openingStock: product.openingStock || product.stock,
        stock: product.stock,
        category: product.category,
        unit: product.unit || 'pcs',
        minStockAlert: product.minStockAlert || 10,
        purchasePrice: product.purchasePrice || 0,
        gstRate: product.gstRate || 18,
        hsnCode: product.hsnCode || '',
        status: product.status || 'active',
        productImage: product.productImage || '',
      });
    } else if (open) {
      setFormData({
        name: '',
        vendorId: '',
        vendorName: '',
        size: '',
        description: '',
        sellingPrice: 0,
        openingStock: 0,
        stock: 0,
        category: 'Other',
        unit: 'pcs',
        minStockAlert: 10,
        purchasePrice: 0,
        gstRate: 18,
        hsnCode: '',
        status: 'active',
        productImage: '',
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {product ? 'Edit Product Master' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Update product details and specifications.' : 'Fill in the details to create a new product master record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-12">
              {/* Section 1: Basic Identity */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Basic Classification</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase opacity-70">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Industrial Valve A1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor" className="text-xs font-bold uppercase opacity-70">Primary Vendor *</Label>
                    <Select 
                      value={formData.vendorId} 
                      onValueChange={(value) => {
                        const vendor = vendors.find(v => v.id === value);
                        setFormData({ 
                          ...formData, 
                          vendorId: value, 
                          vendorName: vendor ? vendor.name : '' 
                        });
                      }}
                      required
                    >
                      <SelectTrigger className={`bg-background border-muted-foreground/20 h-10 ${!formData.vendorId ? 'text-muted-foreground' : ''}`}>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-bold uppercase opacity-70">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-background border-muted-foreground/20 h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesList.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-xs font-bold uppercase opacity-70">Size / Model Specification</Label>
                    <Input
                      id="size"
                      placeholder="e.g. 10HP, 4 Inch, XL"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hsnCode" className="text-xs font-bold uppercase opacity-70">HSN Code</Label>
                    <Input
                      id="hsnCode"
                      placeholder="e.g. 8504"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase opacity-70">Technical Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter detailed product specifications..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background border-muted-foreground/20 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 2: Financials & Units */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Pricing & Commercials</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice" className="text-xs font-bold uppercase opacity-70 text-primary">Standard Selling Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                      <Input
                        id="sellingPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                        required
                        className="pl-8 bg-background border-primary/30 h-10 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-xs font-bold uppercase opacity-70">Unit of Measurement *</Label>
                    <Select 
                      value={formData.unit} 
                      onValueChange={(value) => setFormData({ ...formData, unit: value as UnitType })}
                    >
                      <SelectTrigger className="bg-background border-muted-foreground/20 h-10">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstRate" className="text-xs font-bold uppercase opacity-70">Taxability (GST Rate %)</Label>
                    <Select 
                      value={formData.gstRate.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, gstRate: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-background border-muted-foreground/20 h-10">
                        <SelectValue placeholder="GST %" />
                      </SelectTrigger>
                      <SelectContent>
                        {gstRates.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}% GST</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Section 3: Inventory Controls */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-primary rounded-full" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Inventory Controls</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="openingStock" className="text-xs font-bold uppercase opacity-70">Opening Stock Level</Label>
                    <Input
                      id="openingStock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.openingStock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, openingStock: val, stock: val });
                      }}
                      className="bg-background border-muted-foreground/20 h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minStockAlert" className="text-xs font-bold uppercase opacity-70 text-destructive">Low Stock Alert Trigger</Label>
                    <Input
                      id="minStockAlert"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                      className="bg-background border-destructive/20 h-10"
                    />
                  </div>
                </div>

                
              </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-8 rounded-xl font-medium"
            >
              Discard
            </Button>
            <Button 
              type="submit" 
              className="h-11 px-10 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:translate-y-[-1px] transition-all"
            >
              {product ? 'Save Master Changes' : 'Create Product Master'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}