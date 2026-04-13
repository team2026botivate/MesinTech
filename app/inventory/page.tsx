'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { 
  Package, 
  Search, 
  AlertTriangle,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';

type SortField = 'name' | 'stock' | 'sellingPrice' | 'category';
type SortOrder = 'asc' | 'desc';

export default function InventoryPage() {
  const { products, isLoaded } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse font-medium">Loading Inventory...</p>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'stock':
        comparison = a.stock - b.stock;
        break;
      case 'sellingPrice':
        comparison = a.sellingPrice - b.sellingPrice;
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStockAlert);
  const outOfStock = products.filter(p => p.stock === 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortOrder === 'asc' ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Products</p>
                <p className="text-2xl font-bold text-foreground mt-1">{products.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Boxes className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Stock Value</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalStockValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Stock Alert</p>
                <p className="text-2xl font-bold text-foreground mt-1">{lowStockProducts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Out of Stock</p>
                <p className="text-2xl font-bold text-foreground mt-1">{outOfStock.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Live Stock Inventory
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 bg-background/50 border-muted-foreground/20 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead 
                    className="font-bold text-xs uppercase tracking-wider py-3 pl-6 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Product <SortIcon field="name" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category <SortIcon field="category" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Code</TableHead>
                  <TableHead 
                    className="font-bold text-xs uppercase tracking-wider text-right cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sellingPrice')}
                  >
                    <div className="flex items-center justify-end">
                      Price <SortIcon field="sellingPrice" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-bold text-xs uppercase tracking-wider text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-center">
                      Live Stock <SortIcon field="stock" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Stock Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="py-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{p.name}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {p.hsnCode ? `HSN: ${p.hsnCode}` : 'No HSN Code'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {p.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                          {p.code}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{formatCurrency(p.sellingPrice)}</span>
                          <span className="text-[10px] text-muted-foreground">{p.gstRate}% GST</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-bold ${
                            p.stock === 0 
                              ? 'text-destructive' 
                              : p.stock <= p.minStockAlert 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {p.stock}
                          </span>
                          {p.stock <= p.minStockAlert && p.stock > 0 && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-600 border-amber-600/30">
                              Low
                            </Badge>
                          )}
                          {p.stock === 0 && (
                            <Badge variant="destructive" className="text-[9px] h-4 px-1">
                              Out
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-semibold text-sm">
                          {formatCurrency(p.stock * p.sellingPrice)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}