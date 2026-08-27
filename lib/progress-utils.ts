import type { CashTransaction } from "./business-store";

export const WEEKLY_TRANSACTION_TARGET = 5;

export function startOfWeek(date = new Date()) {
  const start = new Date(date); const day = start.getDay(); const offset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + offset); start.setHours(0, 0, 0, 0); return start;
}
export function weeklyTransactionCount(transactions: CashTransaction[], date = new Date()) {
  const start = startOfWeek(date).getTime(); const end = start + 7 * 24 * 60 * 60 * 1000;
  return transactions.filter((transaction) => { const time = new Date(transaction.date).getTime(); return time >= start && time < end; }).length;
}
export function weeklyRewardKey(date = new Date()) { return `week-${startOfWeek(date).toISOString().slice(0, 10)}`; }
