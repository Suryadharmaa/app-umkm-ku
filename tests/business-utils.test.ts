import { describe, expect, it } from "vitest";
import { calculateMoneyTotals, formatRupiah } from "../lib/business-utils";

describe("business finance utilities", () => {
  it("calculates income, expense, and balance from local cash records", () => {
    expect(calculateMoneyTotals([{ id: "1", type: "income", amount: 150000, note: "Jualan", date: "2026-08-25T00:00:00.000Z" }, { id: "2", type: "expense", amount: 45000, note: "Bahan", date: "2026-08-25T00:00:00.000Z" }])).toEqual({ income: 150000, expense: 45000, balance: 105000 });
  });
  it("formats rupiah without decimal fractions", () => { expect(formatRupiah(50000)).toBe("Rp50.000"); });
});
