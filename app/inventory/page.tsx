'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { 
  Package, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Filter,
  MoreVertical,
  ChevronRight,
  ArrowUpDown,
  Tag,
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/product-form';
import { formatCurrency } from '@/lib/format';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: any) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData });
      toast.success('Product updated successfully');
    } else {
      addProduct(formData);
      toast.success('Product added successfully');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      toast.success('Product deleted successfully');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage your products, track stock levels, and organize by category.</p>
        </div>
        <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-primary/5 border-primary/10 p-2.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Products</p>
              <h3 className="text-lg font-bold leading-tight">{products.length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-blue-500/5 border-blue-500/10 p-2.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Stock</p>
              <h3 className="text-lg font-bold leading-tight">
                {products.reduce((acc, p) => acc + p.stock, 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/10 p-2.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Value</p>
              <h3 className="text-lg font-bold leading-tight">
                {formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 h-10 bg-muted/50 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-foreground">Product</TableHead>
                <TableHead className="font-semibold text-foreground">Category</TableHead>
                <TableHead className="font-semibold text-foreground">Stock Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Price</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                            {p.name}
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-normal bg-muted text-muted-foreground border-none">
                              {p.code}
                            </Badge>
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {p.description || 'No description provided'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium bg-muted/20 border-border text-[11px]">
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${p.stock < 10 ? 'text-destructive' : 'text-foreground'}`}>
                              {p.stock}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">units</span>
                          </div>
                          {p.stock < 10 && (
                            <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-sm">{formatCurrency(p.price)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/5 hover:text-primary transition-colors"
                            onClick={() => handleOpenEditModal(p)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/5 hover:text-destructive transition-colors text-muted-foreground"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Package className="w-8 h-8 opacity-20" />
                        <p>No products found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingProduct 
                ? `Update details for ${editingProduct.name} (${editingProduct.code})`
                : 'Enter the details for the new product to add it to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 px-6 py-6">
              <ProductForm 
                product={editingProduct || undefined} 
                onSubmit={handleSubmit} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
