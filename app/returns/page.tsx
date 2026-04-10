'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ReturnForm } from '@/components/return-form';
import { useData } from '@/lib/data-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X } from 'lucide-react';

export default function ReturnsPage() {
  const { returns, transactions, companies } = useData();
  const [filterType, setFilterType] = useState<'all' | 'sales' | 'purchase'>('all');

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'Unknown';
  };

  const getTransactionInfo = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    return transaction?.invoiceNumber || 'N/A';
  };

  const filteredReturns = returns.filter((r) => filterType === 'all' || r.type === filterType);

  const salesReturnsTotal = returns
    .filter((r) => r.type === 'sales')
    .reduce((sum, r) => sum + r.amount, 0);

  const purchaseReturnsTotal = returns
    .filter((r) => r.type === 'purchase')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Returns</h1>
          <p className="text-sm text-muted-foreground">Manage and track all sales and purchase returns.</p>
        </div>
        <ReturnForm />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="bg-primary/5 border-primary/10 p-3 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Sales Returns</p>
            <p className="text-[10px] text-muted-foreground">
              {returns.filter((r) => r.type === 'sales').length} recorded
            </p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(salesReturnsTotal)}</div>
        </Card>

        <Card className="bg-secondary/5 border-secondary/10 p-3 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-secondary/70">Purchase Returns</p>
            <p className="text-[10px] text-muted-foreground">
              {returns.filter((r) => r.type === 'purchase').length} recorded
            </p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(purchaseReturnsTotal)}</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Returns History</CardTitle>
          <CardDescription>A complete log of all processed returns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={(v) => setFilterType(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {filteredReturns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No returns found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((ret) => (
                      <TableRow key={ret.id}>
                        <TableCell className="font-medium">{ret.invoiceNumber}</TableCell>
                        <TableCell>
                          <Badge variant={ret.type === 'sales' ? 'default' : 'secondary'}>
                            {ret.type === 'sales' ? 'Sale' : 'Purchase'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{getCompanyName(ret.companyId)}</span>
                            <span className="text-[11px] text-muted-foreground">Inv: {getTransactionInfo(ret.transactionId)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground italic">
                          "{ret.reason}"
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "capitalize",
                              ret.status === 'approved' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 
                              ret.status === 'pending' ? 'border-amber-500 text-amber-600 bg-amber-50' : 
                              'border-red-500 text-red-600 bg-red-50'
                            )}
                          >
                            {ret.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(ret.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="sales">
              {/* Similar Table structure for filtered views */}
            </TabsContent>
            <TabsContent value="purchase">
              {/* Similar Table structure for filtered views */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to keep code clean since I'm doing multi-line conditional styles
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
