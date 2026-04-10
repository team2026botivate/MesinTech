'use client';

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from './hooks/use-local-storage';
import { dummyCompanies, dummyTransactions, dummyPayments, dummyReturns, dummyExpenses, dummyNotifications, dummyUser, dummyProducts } from './dummy-data';
import { Company, Transaction, Payment, Return, Expense, Notification, User, Product } from './types';

interface DataContextType {
  companies: Company[];
  transactions: Transaction[];
  payments: Payment[];
  returns: Return[];
  expenses: Expense[];
  notifications: Notification[];
  products: Product[];
  selectedCompanyId: string | null;
  setCompanies: (companies: Company[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setPayments: (payments: Payment[]) => void;
  setReturns: (returns: Return[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setSelectedCompanyId: (companyId: string | null) => void;
  addCompany: (company: Company) => void;
  addTransaction: (transaction: Transaction) => void;
  addPayment: (payment: Payment) => void;
  addReturn: (ret: Return) => void;
  addExpense: (expense: Expense) => void;
  addProduct: (product: Omit<Product, 'id' | 'code'>) => void;
  updateCompany: (company: Company) => void;
  updateTransaction: (transaction: Transaction) => void;
  updateReturn: (ret: Return) => void;
  updateExpense: (expense: Expense) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  deleteTransaction: (transactionId: string) => void;
  deleteReturn: (returnId: string) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  isLoaded: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompaniesState, companiesLoaded] = useLocalStorage<Company[]>(
    'erp_companies',
    dummyCompanies
  );
  const [transactions, setTransactionsState, transactionsLoaded] = useLocalStorage<Transaction[]>(
    'erp_transactions',
    dummyTransactions
  );
  const [payments, setPaymentsState, paymentsLoaded] = useLocalStorage<Payment[]>(
    'erp_payments',
    dummyPayments
  );
  const [returns, setReturnsState, returnsLoaded] = useLocalStorage<Return[]>(
    'erp_returns',
    dummyReturns
  );
  const [expenses, setExpensesState, expensesLoaded] = useLocalStorage<Expense[]>(
    'erp_expenses',
    dummyExpenses
  );
  const [notifications, setNotificationsState, notificationsLoaded] = useLocalStorage<Notification[]>(
    'erp_notifications',
    dummyNotifications
  );
  const [selectedCompanyId, setSelectedCompanyId, selectedCompanyLoaded] = useLocalStorage<string | null>(
    'erp_selected_company',
    null
  );
  const [users, setUsersState, usersLoaded] = useLocalStorage<User[]>(
    'erp_users',
    [dummyUser]
  );
  const [products, setProductsState, productsLoaded] = useLocalStorage<Product[]>(
    'erp_products',
    dummyProducts
  );

  const isLoaded = companiesLoaded && transactionsLoaded && paymentsLoaded && returnsLoaded && expensesLoaded && notificationsLoaded && selectedCompanyLoaded && usersLoaded && productsLoaded;

  const setCompanies = (data: Company[]) => setCompaniesState(data);
  const setTransactions = (data: Transaction[]) => setTransactionsState(data);
  const setPayments = (data: Payment[]) => setPaymentsState(data);
  const setReturns = (data: Return[]) => setReturnsState(data);
  const setExpenses = (data: Expense[]) => setExpensesState(data);
  const setNotifications = (data: Notification[]) => setNotificationsState(data);

  const addCompany = (company: Company) => {
    setCompanies([...companies, company]);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
    
    // Update Stock
    if (transaction.productId && transaction.quantity) {
      const stockChangeType = transaction.type === 'purchase' ? 'add' : 'subtract';
      updateProductStock(transaction.productId, transaction.quantity, stockChangeType);
    } else if (transaction.lineItems) {
      transaction.lineItems.forEach(item => {
        if (item.productId) {
          const stockChangeType = transaction.type === 'purchase' ? 'add' : 'subtract';
          updateProductStock(item.productId, item.quantity, stockChangeType);
        }
      });
    }
  };

  const addPayment = (payment: Payment) => {
    setPayments([...payments, payment]);
  };

  const addReturn = (ret: Return) => {
    setReturns([...returns, ret]);
    
    // Update Stock (only if approved)
    if (ret.status === 'approved' && ret.productId && ret.quantity) {
      const stockChangeType = ret.type === 'sales' ? 'add' : 'subtract';
      updateProductStock(ret.productId, ret.quantity, stockChangeType);
    }
  };

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
  };

  const updateCompany = (company: Company) => {
    setCompanies(companies.map((c) => (c.id === company.id ? company : c)));
  };

  const updateTransaction = (transaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === transaction.id);
    
    // Reverse old stock update
    if (oldTransaction) {
      if (oldTransaction.productId && oldTransaction.quantity) {
        const reverseType = oldTransaction.type === 'purchase' ? 'subtract' : 'add';
        updateProductStock(oldTransaction.productId, oldTransaction.quantity, reverseType);
      } else if (oldTransaction.lineItems) {
        oldTransaction.lineItems.forEach(item => {
          if (item.productId) {
            const reverseType = oldTransaction.type === 'purchase' ? 'subtract' : 'add';
            updateProductStock(item.productId, item.quantity, reverseType);
          }
        });
      }
    }

    // Apply new stock update
    if (transaction.productId && transaction.quantity) {
      const stockChangeType = transaction.type === 'purchase' ? 'add' : 'subtract';
      updateProductStock(transaction.productId, transaction.quantity, stockChangeType);
    } else if (transaction.lineItems) {
      transaction.lineItems.forEach(item => {
        if (item.productId) {
          const stockChangeType = transaction.type === 'purchase' ? 'add' : 'subtract';
          updateProductStock(item.productId, item.quantity, stockChangeType);
        }
      });
    }

    setTransactions(transactions.map((t) => (t.id === transaction.id ? transaction : t)));
  };

  const updateReturn = (ret: Return) => {
    const oldReturn = returns.find(r => r.id === ret.id);
    
    // Reverse old stock update
    if (oldReturn && oldReturn.status === 'approved' && oldReturn.productId && oldReturn.quantity) {
      const reverseType = oldReturn.type === 'sales' ? 'subtract' : 'add';
      updateProductStock(oldReturn.productId, oldReturn.quantity, reverseType);
    }

    // Apply new stock update (only if approved)
    if (ret.status === 'approved' && ret.productId && ret.quantity) {
      const stockChangeType = ret.type === 'sales' ? 'add' : 'subtract';
      updateProductStock(ret.productId, ret.quantity, stockChangeType);
    }

    setReturns(returns.map((r) => (r.id === ret.id ? ret : r)));
  };

  const deleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      if (transaction.productId && transaction.quantity) {
        const reverseType = transaction.type === 'purchase' ? 'subtract' : 'add';
        updateProductStock(transaction.productId, transaction.quantity, reverseType);
      } else if (transaction.lineItems) {
        transaction.lineItems.forEach(item => {
          if (item.productId) {
            const reverseType = transaction.type === 'purchase' ? 'subtract' : 'add';
            updateProductStock(item.productId, item.quantity, reverseType);
          }
        });
      }
    }
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const deleteReturn = (returnId: string) => {
    const ret = returns.find(r => r.id === returnId);
    if (ret && ret.status === 'approved' && ret.productId && ret.quantity) {
      const reverseType = ret.type === 'sales' ? 'subtract' : 'add';
      updateProductStock(ret.productId, ret.quantity, reverseType);
    }
    setReturns(returns.filter(r => r.id !== returnId));
  };

  const updateExpense = (expense: Expense) => {
    setExpenses(expenses.map((e) => (e.id === expense.id ? expense : e)));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const setUsers = (data: User[]) => setUsersState(data);

  const addUser = (user: User) => {
    setUsers([...users, user]);
  };

  const updateUser = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? user : u)));
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const updateProductStock = (productId: string, quantity: number, type: 'add' | 'subtract') => {
    setProductsState(currentProducts => currentProducts.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: type === 'add' ? p.stock + quantity : Math.max(0, p.stock - quantity)
        };
      }
      return p;
    }));
  };

  const addProduct = (product: Omit<Product, 'id' | 'code'>) => {
    const nextIdNumber = products.length > 0 
      ? Math.max(...products.map(p => parseInt(p.code.split('-')[1]) || 0)) + 1 
      : 1;
    const nextCode = `PRD-${nextIdNumber.toString().padStart(3, '0')}`;
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      code: nextCode,
    };
    setProductsState([...products, newProduct]);
  };

  const updateProduct = (product: Product) => {
    setProductsState(products.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (productId: string) => {
    setProductsState(products.filter((p) => p.id !== productId));
  };

  const value: DataContextType = {
    companies,
    transactions,
    payments,
    returns,
    expenses,
    notifications,
    users,
    selectedCompanyId,
    setCompanies,
    setTransactions,
    setPayments,
    setReturns,
    setExpenses,
    setNotifications,
    setUsers,
    setSelectedCompanyId,
    addCompany,
    addTransaction,
    addPayment,
    addReturn,
    addExpense,
    addUser,
    updateCompany,
    updateTransaction,
    updateExpense,
    updateUser,
    deleteUser,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    markNotificationAsRead,
    deleteNotification,
    deleteTransaction,
    deleteReturn,
    isLoaded,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
