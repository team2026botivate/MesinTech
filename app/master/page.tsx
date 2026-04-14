'use client';

import React, { useState } from 'react';
import { useData } from '@/lib/data-context';
import { 
  Package, 
  Users, 
  Building2, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText,
  Phone,
  MapPin,
  CreditCard,
  User as UserIcon,
  ArrowLeftRight
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Product, Company } from '@/lib/types';
import { ProductForm } from '@/components/product-form';
import { CompanyForm } from '@/components/company-form';
import { formatCurrency } from '@/lib/format';
import { getProductStockMetrics } from '@/lib/data-context';

export default function InventoryMasterPage() {
  const { 
    products, addProduct, updateProduct, deleteProduct,
    companies, updateCompany,
    transactions, returns,
    isLoaded 
  } = useData();

  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse font-medium">Loading Master Data...</p>
      </div>
    );
  }

  // Filtering Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.size && p.size.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSuppliers = companies.filter(c => 
    c.type === 'supplier' && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (c.pan && c.pan.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredCustomers = companies.filter(c => 
    c.type === 'customer' && 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (c.contactPerson && c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Handlers
  const handleProductSubmit = (formData: any) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData });
      toast.success('Product updated successfully');
    } else {
      addProduct({ id: `p${Date.now()}`, ...formData });
      toast.success('Product added successfully');
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Master Database</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
                <TabsList className="bg-muted/50 border">
                  <TabsTrigger value="products" className="data-[state=active]:bg-background">
                    <Package className="w-4 h-4 mr-2" />
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="vendors" className="data-[state=active]:bg-background">
                    <Building2 className="w-4 h-4 mr-2" />
                    Vendors
                  </TabsTrigger>
                  <TabsTrigger value="customers" className="data-[state=active]:bg-background">
                    <Users className="w-4 h-4 mr-2" />
                    Customers
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {activeTab === 'products' && (
                <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              )}
              {activeTab === 'vendors' && (
                <CompanyForm defaultType="supplier" trigger={
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Vendor
                  </Button>
                } />
              )}
              {activeTab === 'customers' && (
                <CompanyForm defaultType="customer" trigger={
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Customer
                  </Button>
                } />
              )}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-9 bg-background/50 border-muted-foreground/20 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} className="w-full">
            {/* Products Master Content */}
            <TabsContent value="products" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-3 pl-6">Product Details</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Specification</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Pricing (GST)</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Opening Qty</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Live Stock</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Stock Value</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="py-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm flex items-center gap-2">
                              {p.name}
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-bold bg-muted text-muted-foreground border-none">
                                {p.code}
                              </Badge>
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
                              {p.hsnCode ? `HSN: ${p.hsnCode}` : 'No HSN Code'} 
                              {p.vendorName && ` • ${p.vendorName}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-md w-fit ring-1 ring-blue-500/20">
                              {p.size || 'Standard'}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                              {p.category}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm tracking-tighter">{formatCurrency(p.sellingPrice)}</span>
                            <span className="text-[10px] font-bold text-emerald-600">
                              {p.gstRate}% GST
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className={`text-xs font-bold ${p.stock <= p.minStockAlert ? 'text-destructive' : 'text-foreground'}`}>
                            {p.stock}
                          </span>
</TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-medium">{p.openingStock || 0}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-xs font-bold ${p.stock <= p.minStockAlert ? 'text-destructive' : 'text-foreground'}`}>
                            {p.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                              onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                              onClick={() => { if(confirm('Are you sure you want to delete this master record?')) deleteProduct(p.id); }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Vendors Master Content */}
            <TabsContent value="vendors" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-3 pl-6">Vendor Details</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Contact Info</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Tax Identifiers</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {v.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{v.name}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {v.city && v.state ? `${v.city}, ${v.state}` : 'Global Supplier'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              {v.phone}
                            </div>
                            {v.email && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <FileText className="w-3 h-3 opacity-50" />
                                {v.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md border border-primary/20 w-fit">
                              GST: {v.gstin || 'NON-GST'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-md w-fit">
                              PAN: {v.pan || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <CompanyForm 
                            company={v} 
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Customers Master Content */}
            <TabsContent value="customers" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-3 pl-6">Customer Entity</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Point of Contact</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Trade Terms</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold">
                              {c.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{c.name}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {c.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                              <Users className="w-3 h-3 text-primary" />
                              {c.contactPerson || 'General Billing'}
                            </div>
                            {c.contactPersonPhone && (
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <Phone className="w-3 h-3 opacity-50" />
                                {c.contactPersonPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-xs font-bold text-indigo-700 bg-indigo-500/5 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20">
                                {c.paymentTermsDays} Days
                              </span>
                            </div>
                            {c.creditLimit && (
                              <span className="text-[10px] text-muted-foreground font-medium pl-5">
                                Limit: {formatCurrency(c.creditLimit)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <CompanyForm 
                            company={c} 
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ProductForm 
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={editingProduct || undefined} 
        onSubmit={handleProductSubmit} 
        onCancel={() => setIsProductModalOpen(false)} 
      />
    </div>
  );
}
