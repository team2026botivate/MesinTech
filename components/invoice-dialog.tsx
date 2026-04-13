'use client';

import { useState } from 'react';
import { Transaction, Company } from '@/lib/types';
import { useData } from '@/lib/data-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvoiceDialogProps {
  transaction: Transaction;
  company: Company | undefined;
}

export function InvoiceDialog({ transaction, company }: InvoiceDialogProps) {
  const { products } = useData();
  const [isOpen, setIsOpen] = useState(false);


  const handlePrint = () => {
    // Basic native print dialogue
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 shadow-sm">
          <Printer className="w-4 h-4 mr-2" />
          View / Print
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] bg-background">
        <DialogHeader className="print:hidden">
          <DialogTitle>Document Details</DialogTitle>
        </DialogHeader>

        {/* This container will be specifically styled for print via global CSS or Tailwind print variants */}
        <div id={`invoice-${transaction.id}`} className="p-6 bg-white text-black rounded-lg shadow-sm print:shadow-none print:p-0 my-4 max-h-[70vh] overflow-y-auto">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-6 mb-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-800">DOCUMENT</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{transaction.serialNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-lg text-gray-800">Mesin Tech</h3>
                  <p className="text-sm text-gray-500">123 Business Avenue<br/>Industrial City, IN 400001</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-8">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">BILL TO:</p>
              <h4 className="font-bold text-gray-800">{company?.name || 'Unknown'}</h4>
              {company?.phone && <p className="text-sm text-gray-600">{company.phone}</p>}
              {company?.email && <p className="text-sm text-gray-600">{company.email}</p>}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-gray-500 font-semibold mr-2">Serial Date:</span>
                <span className="text-sm text-gray-800">{formatDate(transaction.date)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-semibold mr-2">Terms:</span>
                <span className="text-sm text-gray-800">{company?.paymentTermsDays || 30} Days</span>
              </div>
            </div>
          </div>

          <Table className="mb-8 text-sm">
            <TableHeader>
              <TableRow className="bg-gray-100 text-gray-700">
                <TableHead className="rounded-l-md font-semibold">Description</TableHead>
                <TableHead className="text-center font-semibold">Qty</TableHead>
                <TableHead className="text-right font-semibold">Price</TableHead>
                <TableHead className="rounded-r-md text-right font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaction.lineItems && transaction.lineItems.length > 0 ? (
                transaction.lineItems.map(item => {
                  const productLine = products.find(p => p.id === item.productId);
                  return (
                    <TableRow key={item.id} className="text-gray-700">
                      <TableCell>
                        <span className="font-medium">{item.description}</span>
                        {productLine && <span className="block text-xs text-gray-500">{productLine.code}</span>}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="text-gray-700">
                  <TableCell>{transaction.description || 'General Item'}</TableCell>
                  <TableCell className="text-center">{1}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.totalAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.totalAmount)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

            <div className="flex justify-between items-start border-t pt-6 border-gray-200">
              <div className="w-1/2 pr-6">
                {transaction.notes && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-1">NOTES:</p>
                    <p className="text-sm text-gray-700">{transaction.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="w-1/3">
                {(transaction.totalGst || transaction.discountAmount) && (
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800">{formatCurrency(transaction.subtotal)}</span>
                  </div>
                )}
                {transaction.discountAmount && (
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-emerald-600">-{formatCurrency(transaction.discountAmount)}</span>
                  </div>
                )}
                {transaction.totalGst && (
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Total GST:</span>
                    <span className="text-gray-800">{formatCurrency(transaction.totalGst)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-800 mt-2">
                  <span className="font-bold text-gray-800">Grand Total:</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(transaction.totalAmount)}</span>
                </div>
              </div>
            </div>
            </CardContent>
            </Card>
          </div>

        <div className="flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handlePrint}>Print Document</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
