export type Company = {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  paymentTermsDays: number;
  email?: string;
  phone?: string;
  ageingBrackets?: {
    bracket1: number; // 0-30 days
    bracket2: number; // 31-60 days
    bracket3: number; // 61-90 days
  };
};

export type TransactionType = 'sale' | 'purchase';

export type LineItem = {
  id: string;
  productId?: string; // Link to inventory
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  companyId: string;
  amount: number;
  date: string;
  invoiceNumber: string;
  description?: string;
  lineItems?: LineItem[];
  taxRate?: number;
  discountAmount?: number;
  status?: 'pending' | 'paid' | 'partial';
  // Additional fields from form
  serialNo?: string;
  dispatchService?: string;
  productId?: string; // For single-product transactions (legacy/simple)
  quantity?: number; // For single-product transactions (legacy/simple)
};

export type Return = {
  id: string;
  transactionId: string;
  productId?: string; // Link to inventory
  quantity: number; // Quantity being returned
  type: TransactionType;
  companyId: string;
  amount: number;
  date: string;
  reason: string;
  invoiceNumber: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type Expense = {
  id: string;
  category: 'courier' | 'travel' | 'food' | 'other';
  amount: number;
  date: string;
  description: string;
  companyId?: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved';
};

export type Payment = {
  id: string;
  transactionId: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  status?: 'pending' | 'completed';
};

export type NotificationType = 'payment_due' | 'payment_overdue' | 'payment_received' | 'return_pending' | 'expense_pending';

export type Notification = {
  id: string;
  type: NotificationType;
  transactionId?: string;
  companyId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  date: string;
  read: boolean;
  actionUrl?: string;
};

export type User = {
  id: string;
  username: string;
  password?: string; // Optional for current user, required for management
  name: string;
  role: 'admin' | 'user';
  accessibleModules: string[]; // List of module hrefs like '/sales', '/settings'
};

export type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};
