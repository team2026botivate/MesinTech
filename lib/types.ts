export type Company = {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  contactPerson?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  paymentTermsDays: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };
  productsSupplied?: string[];
  ratePerProduct?: { productId: string; rate: number }[];
  creditLimit?: number;
  outstandingBalance?: number;
  totalPurchases?: number;
  preferredDispatchMethod?: string;
  notes?: string;
  ageingBrackets?: {
    bracket1: number; // 0-30 days
    bracket2: number; // 31-60 days
    bracket3: number; // 61-90 days
    bracket4: number; // 90+ days
  };
  status?: 'active' | 'inactive';
  createdAt?: string;
};

export type TransactionType = 'sale' | 'purchase';

export type LineItem = {
  id: string;
  productId: string;
  productName?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  gstRate: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  lineTotal: number;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  invoiceNumber: string;
  supplierInvoiceNumber?: string;
  companyId: string;
  companyName?: string;
  billingAddress?: string;
  shippingAddress?: string;
  placeOfSupply?: string;
  lineItems?: LineItem[];
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  taxableAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalGst: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  amountInWords?: string;
  date: string;
  dueDate?: string;
  paymentStatus?: 'paid' | 'partial' | 'pending' | 'overdue';
  dispatchThrough?: string;
  vehicleNumber?: string;
  dispatchId?: string;
  notes?: string;
  termsAndConditions?: string;
  createdBy?: string;
  description?: string;
  status?: 'draft' | 'confirmed' | 'cancelled';
};

export type Return = {
  id: string;
  returnNumber: string;
  type: TransactionType;
  returnType: 'sales' | 'purchase';
  originalTransactionId: string;
  originalInvoiceNumber?: string;
  companyId: string;
  companyName?: string;
  returnDate: string;
  lineItems?: LineItem[];
  returnReason: string;
  refundType?: 'cash_refund' | 'credit_note' | 'exchange';
  debitNoteAmount?: number;
  refundAmount?: number;
  restockToInventory?: boolean;
  stockDeducted?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt?: string;
};

export type Expense = {
  id: string;
  expenseNumber: string;
  expenseType: 'courier' | 'travel' | 'food' | 'other';
  expenseDate: string;
  linkedTransactionId?: string;
  linkedDispatchId?: string;
  companyId?: string;
  amount: number;
  
  // Courier fields
  courierName?: string;
  dispatcherName?: string;
  itemsCount?: number;
  weight?: number;
  courierAmount?: number;
  trackingNumber?: string;
  
  // Travel fields
  fromLocation?: string;
  toLocation?: string;
  travelMode?: string;
  purposeOfTravel?: string;
  travelAmount?: number;
  tollParkingAmount?: number;
  returnTrip?: boolean;
  
  // Food fields
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  numberOfPeople?: number;
  vendorName?: string;
  foodDescription?: string;
  foodAmount?: number;
  
  totalExpense: number;
  receiptUrl?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
};

export type Payment = {
  id: string;
  paymentNumber: string;
  paymentType: 'received' | 'sent';
  linkedTransactionId?: string;
  companyId: string;
  companyName?: string;
  paymentDate: string;
  amount: number;
  paymentMode: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'neft' | 'rtgs';
  referenceNumber?: string;
  bankAccount?: string;
  notes?: string;
  status?: 'pending' | 'completed';
  createdAt?: string;
};

export type Notification = {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'payment_received' | 'return_pending' | 'expense_pending' | 'low_stock' | 'out_of_stock';
  severity: 'info' | 'warning' | 'critical';
  linkedModule?: 'sales' | 'purchase' | 'inventory';
  referenceId?: string;
  transactionId?: string;
  companyId: string;
  companyName?: string;
  message: string;
  daysOverdue?: number;
  amountPending?: number;
  date: string;
  read: boolean;
  actionUrl?: string;
  createdAt?: string;
};

export type User = {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: 'admin' | 'user';
  accessibleModules: string[];
};

export type Product = {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: 'pcs' | 'kg' | 'ltr' | 'box' | 'set' | 'meter' | 'pair';
  openingStock?: number;
  stock: number;
  minStockAlert: number;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  hsnCode?: string;
  productImage?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
};

export type Dispatch = {
  id: string;
  dispatchNumber: string;
  linkedTransactionId: string;
  linkedInvoiceNumber?: string;
  companyId: string;
  companyName?: string;
  dispatchDate: string;
  dispatcherName: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  fromAddress?: string;
  toAddress?: string;
  dispatchStatus: 'pending' | 'packed' | 'dispatched' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  expectedDelivery?: string;
  actualDelivery?: string;
  deliveryProofUrl?: string;
  notes?: string;
  createdAt?: string;
};

export type StockLedgerEntry = {
  id: string;
  productId: string;
  date: string;
  transactionType: 'purchase' | 'sale' | 'sales_return' | 'purchase_return' | 'opening';
  referenceNumber: string;
  quantityIn: number;
  quantityOut: number;
  balance: number;
};

export type DashboardKPIs = {
  totalSales: number;
  totalPurchases: number;
  totalReceivables: number;
  totalPayables: number;
  overdueAmount: number;
  totalExpenses: number;
  totalProducts: number;
  totalStockValue: number;
  paidAmount: number;
  pendingAmount: number;
};