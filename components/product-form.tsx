'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: any) => void;
  onCancel: () => void;
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

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
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
    if (product) {
      setFormData({
        name: product.name,
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
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Industrial Valve A1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-background/50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter product details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background/50 min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="sellingPrice" className="text-sm font-medium">
              Selling Price <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                required
                className="pl-7 bg-background/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit" className="text-sm font-medium">
              Unit <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.unit} 
              onValueChange={(value) => setFormData({ ...formData, unit: value as UnitType })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="openingStock" className="text-sm font-medium">
              Opening Stock
            </Label>
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
              className="bg-background/50"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="minStockAlert" className="text-sm font-medium">
              Minimum Stock Alert Level
            </Label>
            <Input
              id="minStockAlert"
              type="number"
              min="0"
              placeholder="10"
              value={formData.minStockAlert}
              onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="purchasePrice" className="text-sm font-medium">
              Purchase Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="pl-7 bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gstRate" className="text-sm font-medium">
                GST Rate (%)
              </Label>
              <Select 
                value={formData.gstRate.toString()} 
                onValueChange={(value) => setFormData({ ...formData, gstRate: parseInt(value) })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="GST %" />
                </SelectTrigger>
                <SelectContent>
                  {gstRates.map((rate) => (
                    <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hsnCode" className="text-sm font-medium">
                HSN Code
              </Label>
              <Input
                id="hsnCode"
                placeholder="e.g. 8504"
                value={formData.hsnCode}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Active Status</Label>
              <p className="text-xs text-muted-foreground">Product will be available for transactions</p>
            </div>
            <Switch
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="px-6 shadow-sm"
        >
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}