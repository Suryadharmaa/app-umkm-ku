import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf8");

describe("navigasi utama UMKM KU", () => {
  it("menyediakan rute tujuan untuk akses dari Panduan dan Layanan", () => {
    const guide = source("app/(tabs)/guide.tsx");
    const services = source("app/(tabs)/services.tsx");
    const routes = [
      ["/readiness", "app/readiness.tsx"],
      ["/services", "app/(tabs)/services.tsx"],
      ["/business-profile", "app/business-profile.tsx"],
      ["/preferences", "app/preferences.tsx"],
      ["/news", "app/(tabs)/news.tsx"],
    ];
    for (const [route, file] of routes) {
      expect(source(file)).toBeTruthy();
      expect(`${guide}\n${services}`).toContain(route);
    }
  });

  it("menghubungkan tab Belajar Mandiri ke detail materi", () => {
    const guide = source("app/(tabs)/guide.tsx");
    expect(guide).toContain('setSection("lesson")');
    expect(guide).toContain("router.push(`/lesson/${lesson.id}`)");
  });

  it("menyediakan onboarding berurutan dan akses pengulangan dari Pengaturan", () => {
    const onboarding = source("lib/onboarding-provider.tsx");
    const preferences = source("app/preferences.tsx");
    expect(onboarding).toContain("Lengkapi Profil Usaha");
    expect(onboarding).toContain("Catat setiap transaksi");
    expect(onboarding).toContain("Simpan QRIS usaha");
    expect(onboarding).toContain("Pantau kesehatan usaha");
    expect(onboarding).toContain("Simpan laporan PDF");
    expect(onboarding).toContain("Sesuaikan aplikasi");
    expect(preferences).toContain("restartTour");
  });

  it("menjaga seluruh tujuan statis fitur utama tetap memiliki layar", () => {
    const routes: Array<[string, string]> = [
      ["/add-transaction", "app/add-transaction.tsx"],
      ["/analytics", "app/analytics.tsx"],
      ["/budget", "app/budget.tsx"],
      ["/import-pdf", "app/import-pdf.tsx"],
      ["/progress", "app/progress.tsx"],
      ["/qris", "app/qris.tsx"],
      ["/readiness", "app/readiness.tsx"],
      ["/readiness-result", "app/readiness-result.tsx"],
      ["/reminders", "app/reminders.tsx"],
    ];

    for (const [route, file] of routes) {
      expect(source(file)).toBeTruthy();
      expect(route.startsWith("/")).toBe(true);
    }
  });
});
