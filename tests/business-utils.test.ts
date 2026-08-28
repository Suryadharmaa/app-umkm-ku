import { describe, expect, it } from "vitest";
import { calculateMoneyTotals, formatRupiah, getMonthlyCloseReadiness, getSevenDayCashflow } from "../lib/business-utils";

describe("business finance utilities", () => {
  it("calculates income, expense, and balance from local cash records", () => {
    expect(calculateMoneyTotals([{ id: "1", type: "income", amount: 150000, note: "Jualan", date: "2026-08-25T00:00:00.000Z" }, { id: "2", type: "expense", amount: 45000, note: "Bahan", date: "2026-08-25T00:00:00.000Z" }])).toEqual({ income: 150000, expense: 45000, balance: 105000 });
  });
  it("formats rupiah without decimal fractions", () => { expect(formatRupiah(50000)).toBe("Rp50.000"); });
  it("projects seven-day cashflow from the latest thirty days and surfaces upcoming deadlines", () => {
    const reference = new Date("2026-08-28T12:00:00.000Z");
    const result = getSevenDayCashflow([{ id: "1", type: "income", amount: 1000000, note: "Modal", date: "2026-08-01T08:00:00.000Z" }, { id: "2", type: "expense", amount: 300000, note: "Bahan", date: "2026-08-20T08:00:00.000Z" }], [{ id: "deadline", kind: "Pajak", dueDate: "2026-09-01", notificationId: null }], reference);
    expect(result).toMatchObject({ totalBalance: 700000, projectedExpense: 70000, projectedBalance: 630000, isAtRisk: false });
    expect(result.upcomingDeadlines).toHaveLength(1);
  });
  it("requires reviewed records, an active budget, and an exported report before monthly close", () => {
    expect(getMonthlyCloseReadiness({ transactionCount: 1, budgetCount: 1, completedSteps: ["records", "budget", "export"] })).toMatchObject({ completed: 3, recordsReady: true, budgetReady: true, exportReady: true });
    expect(getMonthlyCloseReadiness({ transactionCount: 0, budgetCount: 1, completedSteps: ["records", "budget", "export"] }).completed).toBe(2);
  });
});
