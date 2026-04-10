import { Company, Transaction, Payment, Return, Expense } from './types';

export function calculateDueDate(transaction: Transaction, company: Company): string {
  const date = new Date(transaction.date);
  date.setDate(date.getDate() + company.paymentTermsDays);
  return date.toISOString().split('T')[0];
}

export function getRemainingBalance(transaction: Transaction, payments: Payment[]): number {
  const paidAmount = payments
    .filter((p) => p.transactionId === transaction.id)
    .reduce((sum, p) => sum + p.amount, 0);
  return transaction.amount - paidAmount;
}

export function isOverdue(transaction: Transaction, company: Company): boolean {
  const dueDate = new Date(calculateDueDate(transaction, company));
  return dueDate < new Date();
}

export function getDaysOverdue(transaction: Transaction, company: Company): number {
  const dueDate = new Date(calculateDueDate(transaction, company));
  const today = new Date();
  if (dueDate >= today) return 0;
  return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateDelayLoss(transaction: Transaction, company: Company, payments: Payment[]): number {
  const remaining = getRemainingBalance(transaction, payments);
  if (remaining <= 0) return 0;
  
  const daysOverdue = getDaysOverdue(transaction, company);
  if (daysOverdue <= 0) return 0;
  
  // Simple delay loss: 0.05% per day
  const delayLossRate = 0.0005;
  return remaining * daysOverdue * delayLossRate;
}

export function calculateReturnImpact(returns: Return[], transactionType: 'sale' | 'purchase'): number {
  return returns
    .filter((r) => r.type === transactionType && r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);
}

export function calculateApprovedExpenses(expenses: Expense[]): number {
  return expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
}

export function calculatePLView(
  transactions: Transaction[],
  companies: Company[],
  payments: Payment[],
  returns: Return[] = [],
  expenses: Expense[] = []
) {
  const sales = transactions.filter((t) => t.type === 'sale');
  const purchases = transactions.filter((t) => t.type === 'purchase');

  const totalSales = sales.reduce((sum, t) => sum + t.amount, 0);
  const totalPurchases = purchases.reduce((sum, t) => sum + t.amount, 0);
  
  // Apply returns/adjustments
  const salesReturns = calculateReturnImpact(returns, 'sale');
  const purchaseReturns = calculateReturnImpact(returns, 'purchase');
  const netRevenue = totalSales - salesReturns;
  const netCOGS = totalPurchases - purchaseReturns;
  const grossProfit = netRevenue - netCOGS;

  // Realized: based on payments received/made
  const salesPaid = sales.reduce((sum, t) => {
    const paid = payments
      .filter((p) => p.transactionId === t.id)
      .reduce((s, p) => s + p.amount, 0);
    return sum + paid;
  }, 0);

  const purchasesPaid = purchases.reduce((sum, t) => {
    const paid = payments
      .filter((p) => p.transactionId === t.id)
      .reduce((s, p) => s + p.amount, 0);
    return sum + paid;
  }, 0);

  const approvedExpenses = calculateApprovedExpenses(expenses);
  const realizedProfit = salesPaid - purchasesPaid - approvedExpenses;

  // Expected: based on invoice amount
  const expectedProfit = grossProfit - approvedExpenses;

  // Risk-adjusted: considering overdue amounts and delay loss
  const delayLosses = transactions.reduce((sum, t) => {
    const company = companies.find((c) => c.id === t.companyId);
    if (!company) return sum;
    return sum + calculateDelayLoss(t, company, payments);
  }, 0);

  const riskAdjustedProfit = expectedProfit - delayLosses;

  return {
    realized: {
      sales: salesPaid,
      purchases: purchasesPaid,
      profit: realizedProfit,
    },
    expected: {
      sales: netRevenue,
      purchases: netCOGS,
      profit: expectedProfit,
    },
    riskAdjusted: {
      sales: netRevenue,
      purchases: netCOGS,
      profit: riskAdjustedProfit,
      delayLosses,
    },
    returns: {
      sales: salesReturns,
      purchases: purchaseReturns,
    },
    expenses: approvedExpenses,
  };
}
