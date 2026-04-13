'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ReturnForm } from '@/components/return-form';
import { Package, Truck } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, RotateCcw, Package2, MoreVertical, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function ReturnsPage() {
  const { returns, transactions, companies, isLoaded } = useData();
  const [activeTab, setActiveTab] = useState<'sales' | 'purchase'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sales' | 'purchase'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const getTransactionInfo = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    return transaction?.serialNumber || 'N/A';
  };

const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchesType = activeTab === 'sales' ? r.returnType === 'sales' : r.returnType === 'purchase';
      const matchesSearch = 
        searchQuery === '' || 
        r.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCompanyName(r.companyId).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesCompany = companyFilter === 'all' || r.companyId === companyFilter;

      return matchesType && matchesSearch && matchesStatus && matchesCompany;
    });
  }, [returns, activeTab, searchQuery, statusFilter, companyFilter, companies]);

  const salesReturnsTotal = returns
    .filter((r) => r.returnType === 'sales')
    .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  const purchaseReturnsTotal = returns
    .filter((r) => r.returnType === 'purchase')
    .reduce((sum, r) => sum + (r.debitNoteAmount || r.refundAmount || 0), 0);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading returns...</p>
      </div>
    );
  }

  const relevantCompanies = companies.filter(c => {
    if (activeTab === 'sales') return c.type === 'customer';
    if (activeTab === 'purchase') return c.type === 'supplier';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Returns</h1>
          <p className="text-sm text-muted-foreground">Manage and track all sales and purchase returns.</p>
        </div>
        <ReturnForm defaultReturnType={activeTab} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sales' | 'purchase')} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-muted/50">
          <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="w-4 h-4" />
            Sales Return
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
            <Truck className="w-4 h-4" />
            Purchase Return
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 md:grid-cols-2">
        {activeTab === 'sales' && (
          <Card className="bg-primary/5 border-primary/10 p-3 flex flex-row items-center justify-between overflow-hidden relative group md:col-span-2">
            <div className="absolute -right-4 -top-4 bg-primary/10 w-16 h-16 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            <div className="space-y-0.5 relative z-10">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Sales Returns Value</p>
              <p className="text-[10px] text-muted-foreground">
                {returns.filter((r) => r.returnType === 'sales').length} items returned by customers
              </p>
            </div>
            <div className="text-xl font-bold relative z-10">{formatCurrency(salesReturnsTotal)}</div>
          </Card>
        )}
        {activeTab === 'purchase' && (
          <Card className="bg-secondary/5 border-secondary/10 p-3 flex flex-row items-center justify-between overflow-hidden relative group md:col-span-2">
            <div className="absolute -right-4 -top-4 bg-secondary/10 w-16 h-16 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
            <div className="space-y-0.5 relative z-10">
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Purchase Returns Value</p>
              <p className="text-[10px] text-muted-foreground">
                {returns.filter((r) => r.returnType === 'purchase').length} items returned to suppliers
              </p>
            </div>
            <div className="text-xl font-bold relative z-10">{formatCurrency(purchaseReturnsTotal)}</div>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Returns History</CardTitle>
              <CardDescription>A complete log of all processed returns and debit notes.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Return ID or Entity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-muted-foreground/20"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] bg-background/50 border-muted-foreground/20">
                    <Filter className="h-3.5 w-3.5 mr-2 opacity-50" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-muted-foreground/20">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {relevantCompanies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredReturns.length === 0 ? (
              <div className="text-center py-20 border rounded-2xl bg-muted/5 border-dashed">
                <RotateCcw className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No returns matching your filters</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setFilterType('all');
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCompanyFilter('all');
                  }}
                  className="text-primary mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-muted-foreground/10 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Return ID</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Date</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Entity & Serial</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Reason</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Status</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-wider py-4">Amount</TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-wider py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((ret) => (
                      <TableRow key={ret.id} className="group hover:bg-muted/10 transition-colors">
                        <TableCell className="font-bold text-sm">{ret.returnNumber}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(ret.returnDate)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-foreground">{getCompanyName(ret.companyId)}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Package2 className="h-3 w-3" />
                              Orig: {getTransactionInfo(ret.originalTransactionId)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[180px]">
                          <div className="flex flex-col">
                            <span className="capitalize text-xs font-medium text-foreground">{ret.returnReason.replace('_', ' ')}</span>
                            {ret.notes && (
                              <span className="text-[10px] text-muted-foreground truncate italic opacity-60">"{ret.notes}"</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "capitalize text-[10px] font-bold px-2 py-0 h-5",
                              ret.status === 'approved' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50' : 
                              ret.status === 'pending' ? 'border-amber-500/30 text-amber-600 bg-amber-50' : 
                              'border-red-500/30 text-red-600 bg-red-50'
                            )}
                          >
                            {ret.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-sm">
                          {formatCurrency(ret.refundAmount || ret.debitNoteAmount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ReturnForm initialReturn={ret} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


