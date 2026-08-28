import { describe, expect, it, vi } from "vitest";

vi.mock("expo-crypto", () => ({
  getRandomBytesAsync: async (length: number) => Uint8Array.from({ length }, (_, index) => (index * 17 + 11) % 256),
}));

import { createEncryptedBusinessBackup, decryptEncryptedBusinessBackup, inspectEncryptedBusinessBackup } from "../lib/business-backup";
import type { BusinessState } from "../lib/business-store";

const state: BusinessState = {
  transactions: [{ id: "tx-1", type: "income", amount: 250000, note: "Penjualan hari ini", date: "2026-08-28T08:00:00.000Z", category: "Penjualan" }],
  readiness: { profile: true, product: true, money: true, legal: false, capital: null },
  guideProgress: {}, completedLessons: [], newsRead: true, savedArticleIds: [], articleNotes: {}, interests: [], qrisUri: null,
  reminderHour: null, reminderNotificationId: null, budgets: { Operasional: 500000 }, deadlines: [], budgetAlertKeys: [],
  profile: { businessName: "Kedai Nusantara", ownerName: "Sari", logoUri: null }, monthlyCloseProgress: {}, closedMonths: [], lastBackupAt: null,
};

describe("backup data UMKM KU", () => {
  it("mengenkripsi, memeriksa ringkasan, dan mendekripsi data yang sama", async () => {
    const backup = await createEncryptedBusinessBackup(state, "rahasia-usaha-2026");
    expect(backup.serialized).not.toContain("Penjualan hari ini");
    expect(inspectEncryptedBusinessBackup(backup.serialized)).toMatchObject({ transactionCount: 1, businessName: "Kedai Nusantara" });
    await expect(decryptEncryptedBusinessBackup(backup.serialized, "rahasia-usaha-2026")).resolves.toMatchObject({ data: { transactions: state.transactions } });
  });

  it("menolak kata sandi salah dan backup yang tidak sesuai format", async () => {
    const backup = await createEncryptedBusinessBackup(state, "rahasia-usaha-2026");
    await expect(decryptEncryptedBusinessBackup(backup.serialized, "sandi-yang-berbeda")).rejects.toThrow("Kata sandi salah");
    expect(() => inspectEncryptedBusinessBackup("bukan json")).toThrow("bukan format JSON");
  });
});
