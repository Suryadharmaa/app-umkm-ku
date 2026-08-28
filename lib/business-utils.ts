import type { BusinessDeadline, CashTransaction, ExpenseCategory, IncomeCategory } from "./business-store";

export function formatRupiah(amount: number) {
  return `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function calculateMoneyTotals(transactions: CashTransaction[]) {
  const income = transactions.filter((transaction) => transaction.type === "income").reduce((total, transaction) => total + transaction.amount, 0);
  const expense = transactions.filter((transaction) => transaction.type === "expense").reduce((total, transaction) => total + transaction.amount, 0);
  return { income, expense, balance: income - expense };
}

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(isoDate));
}

export function getMonthlySummary(transactions: CashTransaction[], referenceDate = new Date()) {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  const totals = calculateMoneyTotals(monthlyTransactions);
  const byWeek = Array.from({ length: 4 }, () => ({ income: 0, expense: 0 }));
  monthlyTransactions.forEach((transaction) => {
    const day = new Date(transaction.date).getDate();
    const week = Math.min(3, Math.floor((day - 1) / 7));
    byWeek[week][transaction.type] += transaction.amount;
  });
  const expenseByCategory = monthlyTransactions.filter((transaction) => transaction.type === "expense").reduce<Partial<Record<ExpenseCategory, number>>>((result, transaction) => {
    const category = (transaction.category ?? "Operasional") as ExpenseCategory;
    result[category] = (result[category] ?? 0) + transaction.amount;
    return result;
  }, {});
  const incomeByCategory = monthlyTransactions.filter((transaction) => transaction.type === "income").reduce<Partial<Record<IncomeCategory, number>>>((result, transaction) => {
    const category = (transaction.category ?? "Penjualan") as IncomeCategory;
    result[category] = (result[category] ?? 0) + transaction.amount;
    return result;
  }, {});
  return { monthLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(referenceDate), transactions: monthlyTransactions, totals, byWeek, expenseByCategory, incomeByCategory };
}

export function monthDateOffset(offset: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return date;
}

export function monthKey(referenceDate: Date) {
  return `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
}

export function getSevenDayCashflow(transactions: CashTransaction[], deadlines: BusinessDeadline[], referenceDate = new Date()) {
  const totalBalance = calculateMoneyTotals(transactions).balance;
  const thirtyDaysAgo = new Date(referenceDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentExpense = transactions
    .filter((item) => item.type === "expense" && new Date(item.date) >= thirtyDaysAgo && new Date(item.date) <= referenceDate)
    .reduce((total, item) => total + item.amount, 0);
  const averageDailyExpense = recentExpense / 30;
  const projectedExpense = Math.round(averageDailyExpense * 7);
  const endDate = new Date(referenceDate);
  endDate.setDate(endDate.getDate() + 7);
  const upcomingDeadlines = deadlines
    .filter((deadline) => {
      const due = new Date(`${deadline.dueDate}T23:59:59`);
      return due >= referenceDate && due <= endDate;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const projectedBalance = totalBalance - projectedExpense;
  return { totalBalance, averageDailyExpense: Math.round(averageDailyExpense), projectedExpense, projectedBalance, upcomingDeadlines, isAtRisk: projectedBalance < 0 };
}

export function getMonthlyCloseReadiness({ transactionCount, budgetCount, completedSteps }: { transactionCount: number; budgetCount: number; completedSteps: string[] }) {
  const recordsReady = transactionCount > 0 && completedSteps.includes("records");
  const budgetReady = budgetCount > 0 && completedSteps.includes("budget");
  const exportReady = completedSteps.includes("export");
  return { recordsReady, budgetReady, exportReady, completed: [recordsReady, budgetReady, exportReady].filter(Boolean).length };
}
