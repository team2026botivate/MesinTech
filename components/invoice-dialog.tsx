'use client';

import { useState, useMemo } from 'react';
import { Transaction, Company } from '@/lib/types';
import { useData } from '@/lib/data-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { OWN_COMPANY } from '@/lib/constants';

interface InvoiceDialogProps {
  transaction: Transaction;
  company: Company | undefined;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InvoiceDialog({ transaction, company, isOpen: externalIsOpen, onOpenChange }: InvoiceDialogProps) {
  const { products } = useData();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const handlePrint = () => {
    window.print();
  };

  const gstBreakdown = useMemo(() => {
    const breakdown: Record<string, { taxableAmount: number, cgstRate: number, cgstAmount: number, sgstRate: number, sgstAmount: number, totalTax: number }> = {};
    
    transaction.lineItems?.forEach(item => {
      const hsn = item.hsnCode || 'N/A';
      if (!breakdown[hsn]) {
        breakdown[hsn] = { taxableAmount: 0, cgstRate: item.gstRate / 2, cgstAmount: 0, sgstRate: item.gstRate / 2, sgstAmount: 0, totalTax: 0 };
      }
      const itemTaxable = item.lineTotal;
      const itemGst = (itemTaxable * item.gstRate) / 100;
      
      breakdown[hsn].taxableAmount += itemTaxable;
      breakdown[hsn].cgstAmount += itemGst / 2;
      breakdown[hsn].sgstAmount += itemGst / 2;
      breakdown[hsn].totalTax += itemGst;
    });
    
    return breakdown;
  }, [transaction]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 shadow-sm">
            <Printer className="w-4 h-4 mr-2" />
            View / Print
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[850px] bg-white p-0 overflow-hidden max-h-[95vh] flex flex-col">
        <DialogHeader className="p-4 border-b print:hidden">
          <DialogTitle>Tax Invoice Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 print:bg-white print:p-0">
          <div id={`invoice-${transaction.id}`} className="bg-white text-black shadow-lg print:shadow-none mx-auto w-full max-w-[210mm] min-h-[297mm] p-[10mm] flex flex-col border border-gray-200 print:border-none">
            
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block px-4">Tax Invoice</h1>
            </div>

            {/* Header Section */}
            <div className="grid grid-cols-2 border border-black text-[12px]">
              <div className="p-4 border-r border-black flex gap-4">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                  <img src="/placeholder-logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase leading-tight">{OWN_COMPANY.name}</h2>
                  <p className="mt-1 leading-tight">{OWN_COMPANY.address}</p>
                  <p className="mt-1">Phone no.: {OWN_COMPANY.phone}</p>
                  <p>Email: {OWN_COMPANY.email}</p>
                  <p className="font-bold">GSTIN: {OWN_COMPANY.gstin}</p>
                  <p>State: {OWN_COMPANY.state}</p>
                </div>
              </div>
              <div className="grid grid-rows-2">
                <div className="grid grid-cols-2 border-b border-black">
                  <div className="p-2 border-r border-black">
                    <p className="text-gray-600">Invoice No.</p>
                    <p className="font-bold">{transaction.serialNumber}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-gray-600">Date</p>
                    <p className="font-bold">{transaction.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-2 border-r border-black">
                    <p className="text-gray-600">Place of Supply</p>
                    <p className="font-bold">{transaction.placeOfSupply || OWN_COMPANY.state}</p>
                  </div>
                  <div className="p-2">
                    {transaction.transferredFrom && (
                      <>
                        <p className="text-gray-600 text-[10px] leading-tight">Replaces</p>
                        <p className="font-bold leading-tight">{transaction.transferredFrom}</p>
                      </>
                    )}
                    {transaction.transferredTo && (
                      <>
                        <p className="text-red-600 text-[10px] leading-tight">Cancelled & Moved To</p>
                        <p className="font-bold text-red-600 leading-tight">{transaction.transferredTo}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="border-x border-b border-black p-4 text-[12px]">
              <p className="text-gray-600 font-bold mb-1">Bill To</p>
              <h3 className="text-sm font-black uppercase mb-1">{company?.name || transaction.companyName}</h3>
              <p className="max-w-md">{transaction.billingAddress || company?.address}</p>
              {company?.gstin && <p className="font-bold mt-1">GSTIN Number: {company.gstin}</p>}
              <p>State: {company?.state || transaction.placeOfSupply}</p>
            </div>

            {/* Items Table */}
            <div className="border-x border-b border-black overflow-hidden">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-black">
                    <th className="border-r border-black p-1 w-8">#</th>
                    <th className="border-r border-black p-1 text-left">Item name</th>
                    <th className="border-r border-black p-1">HSN/ SAC</th>
                    <th className="border-r border-black p-1">Quantity</th>
                    <th className="border-r border-black p-1">Unit</th>
                    <th className="border-r border-black p-1">Price/ Unit</th>
                    <th className="border-r border-black p-1">GST</th>
                    <th className="p-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(transaction.lineItems || []).map((item, idx) => (
                    <tr key={item.id} className="border-b border-black/10 last:border-b-0">
                      <td className="border-r border-black p-1 text-center font-bold">{idx + 1}</td>
                      <td className="border-r border-black p-1 font-bold">{item.description}</td>
                      <td className="border-r border-black p-1 text-center">{item.hsnCode}</td>
                      <td className="border-r border-black p-1 text-center uppercase font-bold">{item.quantity}</td>
                      <td className="border-r border-black p-1 text-center uppercase">{item.unit}</td>
                      <td className="border-r border-black p-1 text-right">₹ {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="border-r border-black p-1 text-right">
                        ₹ {((item.lineTotal * item.gstRate) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br/>
                        <span className="text-[10px] text-gray-500">({item.gstRate}%)</span>
                      </td>
                      <td className="p-1 text-right font-bold">₹ {((item.lineTotal + (item.lineTotal * item.gstRate) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-black font-bold">
                    <td colSpan={3} className="border-r border-black p-1 text-right">Total</td>
                    <td className="border-r border-black p-1 text-center">{(transaction.lineItems || []).reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">₹ {(transaction.totalGst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">₹ {transaction.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-2 border-x border-b border-black text-[12px]">
              <div className="p-2 border-r border-black flex flex-col justify-between">
                <div>
                  <p className="text-gray-500">Invoice Amount In Words</p>
                  <p className="font-bold">{transaction.amountInWords || 'N/A'}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-black/10">
                  <p className="text-gray-500">Payment Mode</p>
                  <p className="font-bold uppercase">{transaction.paymentMethod === 'bill' ? 'Credit' : 'Cash'}</p>
                </div>
              </div>
              <div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="p-1 pl-2 text-gray-600 font-bold uppercase">Sub Total</td>
                      <td className="p-1 text-right font-bold">₹ {(transaction.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t border-black">
                      <td className="p-1 pl-2 font-black uppercase text-sm">Total</td>
                      <td className="p-1 text-right font-black text-sm">₹ {transaction.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="p-1 pl-2 text-gray-600">Received</td>
                      <td className="p-1 text-right">₹ {(transaction.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-t border-black font-bold">
                      <td className="p-1 pl-2 text-gray-600">Balance</td>
                      <td className="p-1 text-right">₹ {(transaction.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GST Breakdown Section */}
            <div className="border-x border-b border-black overflow-hidden">
              <table className="w-full text-center text-[11px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-black font-bold font-bold">
                    <th rowSpan={2} className="border-r border-black p-1">HSN/ SAC</th>
                    <th rowSpan={2} className="border-r border-black p-1">Taxable amount</th>
                    <th colSpan={2} className="border-r border-black p-1">CGST</th>
                    <th colSpan={2} className="border-r border-black p-1">SGST</th>
                    <th rowSpan={2} className="p-1">Total Tax Amount</th>
                  </tr>
                  <tr className="bg-gray-50 border-b border-black text-[10px]">
                    <th className="border-r border-black p-1">Rate</th>
                    <th className="border-r border-black p-1">Amount</th>
                    <th className="border-r border-black p-1">Rate</th>
                    <th className="border-r border-black p-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(gstBreakdown).map(([hsn, data]) => (
                    <tr key={hsn} className="border-b border-black/10 last:border-b-0">
                      <td className="border-r border-black p-1">{hsn}</td>
                      <td className="border-r border-black p-1 text-right font-bold">₹ {data.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="border-r border-black p-1">{data.cgstRate.toFixed(1)}%</td>
                      <td className="border-r border-black p-1 text-right font-bold">₹ {data.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="border-r border-black p-1">{data.sgstRate.toFixed(1)}%</td>
                      <td className="border-r border-black p-1 text-right font-bold">₹ {data.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-1 text-right font-bold">₹ {data.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-black font-bold text-[12px]">
                    <td className="border-r border-black p-1 text-right">Total</td>
                    <td className="border-r border-black p-1 text-right">₹ {transaction.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">₹ {(transaction.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 text-right">₹ {(transaction.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-1 text-right">₹ {(transaction.totalGst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-3 border-x border-b border-black text-[12px] flex-1 min-h-[100px]">
              <div className="p-2 border-r border-black">
                <p className="font-bold border-b border-black/10 mb-2">Bank Details</p>
                <div className="text-[11px] space-y-0.5">
                  <p>Name: <span className="font-bold uppercase">{OWN_COMPANY.bankDetails.name}</span></p>
                  <p>Account No.: <span className="font-bold">{OWN_COMPANY.bankDetails.accountNo}</span></p>
                  <p>IFSC code: <span className="font-bold">{OWN_COMPANY.bankDetails.ifsc}</span></p>
                  <p className="leading-tight">Account Holder's Name: <span className="font-bold uppercase">{OWN_COMPANY.bankDetails.accountHolder}</span></p>
                </div>
              </div>
              <div className="p-2 border-r border-black">
                <p className="font-bold border-b border-black/10 mb-2">Terms and conditions</p>
                {OWN_COMPANY.terms.map((term, i) => (
                  <p key={i} className="text-[11px] leading-tight mb-1">{term}</p>
                ))}
              </div>
              <div className="p-2 flex flex-col justify-between">
                <div className="text-center font-bold">
                  <p>For: {OWN_COMPANY.name}</p>
                </div>
                <div className="text-center font-black uppercase text-sm mt-auto">
                  <p>{OWN_COMPANY.name}</p>
                </div>
              </div>
            </div>

            {/* Acknowledgment Section */}
            <div className="mt-8 border-t-2 border-dashed border-gray-400 pt-4 print:mt-12">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold uppercase tracking-widest">Acknowledgment</h3>
              </div>
              <div className="text-center text-primary-600 font-black text-xl mb-4 italic" style={{ color: '#8b8efc' }}>
                {OWN_COMPANY.name}
              </div>
              <div className="flex justify-between text-[12px]">
                <div className="space-y-1">
                  <p className="text-gray-500">Invoice To:</p>
                  <p className="font-black uppercase text-sm">{company?.name || transaction.companyName}</p>
                  <p className="max-w-xs">{transaction.billingAddress || company?.address}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Invoice Details:</p>
                  <p>Invoice No. : <span className="font-bold">{transaction.serialNumber}</span></p>
                  <p>Invoice Date : <span className="font-bold">{transaction.date}</span></p>
                  <p>Invoice Amount : <span className="font-bold">{transaction.totalAmount.toLocaleString('en-IN')}</span></p>
                </div>
                <div className="flex flex-col justify-end text-center">
                  <div className="border-t border-black border-dotted pt-1 mt-8 w-48">
                    <p className="text-[10px]">Receiver's Seal & Sign</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t print:hidden bg-white">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          <Button onClick={handlePrint}>Print Document</Button>
        </div>
      </DialogContent>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-${transaction.id}, #invoice-${transaction.id} * {
            visibility: visible;
          }
          #invoice-${transaction.id} {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            height: auto;
          }
          @page {
            size: A4;
            margin: 5mm;
          }
        }
      `}</style>
    </Dialog>
  );
}
