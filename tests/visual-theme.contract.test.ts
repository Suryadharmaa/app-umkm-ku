import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(`${process.cwd()}/${path}`, "utf8");

describe("kontrak visual Light dan Dark UMKM KU", () => {
  it("memiliki token kanvas, teks, dan batas yang berbeda untuk tiap tema", () => {
    const theme = source("theme.config.js");
    const requiredTokens = ["primary", "background", "surface", "foreground", "muted", "border", "success", "warning", "error"];

    for (const token of requiredTokens) {
      expect(theme).toContain(`${token}: { light:`);
    }

    expect(theme).toContain("background: { light: '#FFFFFF', dark: '#101827' }");
    expect(theme).toContain("foreground: { light: '#29435B', dark: '#EFF5FF' }");
    expect(theme).toContain("muted: { light: '#718292', dark: '#FFFFFF' }");
    expect(theme).toContain("border: { light: '#E2E9ED', dark: '#2A3B54' }");
  });

  it("menerapkan token tema pada web dan native tanpa memaksa skema perangkat", () => {
    const provider = source("lib/theme-provider.tsx");
    expect(provider).toContain("nativewindColorScheme.set(scheme)");
    expect(provider).toContain("root.dataset.theme = scheme");
    expect(provider).toContain('root.style.setProperty(`--color-${token}`, value)');
    expect(provider).not.toContain("Appearance.setColorScheme");
  });

  it("menjaga layar kritis mempunyai cabang visual mode gelap", () => {
    const screens = [
      "app/(tabs)/money.tsx",
      "app/(tabs)/services.tsx",
      "app/(tabs)/guide.tsx",
      "app/preferences.tsx",
      "app/progress.tsx",
      "app/(tabs)/index.tsx",
      "app/(tabs)/news.tsx",
      "app/article/[id].tsx",
      "app/business-profile.tsx",
      "app/lesson/[id].tsx",
      "app/guide/[id].tsx",
      "app/readiness.tsx",
      "app/readiness-result.tsx",
      "app/add-transaction.tsx",
      "app/budget.tsx",
      "app/import-pdf.tsx",
      "app/analytics.tsx",
      "app/service/[id].tsx",
    ];

    for (const screen of screens) {
      const content = source(screen);
      expect(content).toMatch(/useThemeContext|useColors|colorScheme|dark/);
      expect(content).not.toContain("#AAB9CE");
    }

    expect(source("components/screen-back.tsx")).toContain('titleDark: { color: "#FFFFFF" }');
    expect(source("app/(tabs)/index.tsx")).toContain('textDark: { color: "#FFFFFF" }');
    expect(source("app/(tabs)/news.tsx")).toContain('textDark: { color: "#FFFFFF" }');
    expect(source("app/reminders.tsx")).toContain("useThemeContext");
    expect(source("app/reminders.tsx")).toContain('textDark: { color: "#FFFFFF" }');
    expect(source("app/article/[id].tsx")).toContain('dark && styles.textDark');
    expect(source("app/business-profile.tsx")).toContain('dark && styles.textDark');
    expect(source("app/lesson/[id].tsx")).toContain('dark && styles.textDark');
    expect(source("app/guide/[id].tsx")).toContain('dark && styles.textDark');
    expect(source("app/readiness.tsx")).toContain('dark && styles.textDark');
    expect(source("app/readiness-result.tsx")).toContain('dark && styles.textDark');
    expect(source("app/progress.tsx")).not.toContain('locked: { opacity: .65 }');
    expect(source("app/add-transaction.tsx")).toContain('dark && styles.textDark');
    expect(source("app/budget.tsx")).toContain('dark && styles.textDark');
    expect(source("app/import-pdf.tsx")).toContain('dark && styles.textDark');
    expect(source("app/analytics.tsx")).toContain('dark && s.textDark');
    expect(source("app/backup.tsx")).toContain('textDark: { color: "#FFFFFF" }');
    expect(source("app/monthly-close.tsx")).toContain('textDark: { color: "#FFFFFF" }');
    expect(source("app/service/[id].tsx")).toContain('dark && styles.textDark');
  });

  it("menjaga kartu lencana aman untuk Light/Dark dan lintas platform", () => {
    const badge = source("components/badge-share-sheet.tsx");
    expect(badge).toContain('Platform.OS === "web" ? View : ViewShot');
    expect(badge).toContain('format === "story"');
    expect(badge).toContain("celebrationsEnabled");
    expect(badge).toContain("albumCount");
    expect(badge).toContain('sheetDark: { backgroundColor: "#172235"');
    expect(badge).toContain('textDark: { color: "#FFFFFF" }');
    expect(source("components/milestone-rewards.tsx")).toContain('cardDark: { backgroundColor: "#172235"');
    expect(source("app/qris.tsx")).toContain('fullscreenFooterText: { color: "#FFFFFF"');
  });

  it("menjaga kontrol privasi nominal pada dashboard", () => {
    const dashboard = source("app/(tabs)/index.tsx");
    expect(dashboard).toContain('AMOUNT_VISIBILITY_KEY = "umkm-ku-hide-amounts"');
    expect(dashboard).toContain('BrandIcon name={amountsHidden ? "eye-off" : "eye"}');
    expect(dashboard).toContain('amountsHidden ? "••••••" : formatRupiah(amount)');
    expect(dashboard).toContain('AsyncStorage.setItem(AMOUNT_VISIBILITY_KEY, String(next))');
    expect(source("components/brand-assets.tsx")).toContain('case "eye-off"');
  });

  it("menjaga modul galeri kompatibel dengan Expo Go", () => {
    const packageJson = source("package.json");
    expect(packageJson).toMatch(/"expo-media-library": "[~^]18\.2\.1"/);
    expect(packageJson).toContain('"expo-asset": "~12.0.13"');
    expect(packageJson).toMatch(/"exclude":\s*\[\s*"@react-navigation\/bottom-tabs",\s*"@react-navigation\/native"\s*\]/s);
    expect(source("components/badge-share-sheet.tsx")).toContain('require("expo-media-library")');
    expect(source("app.config.ts")).toContain('"expo-asset"');
  });

  it("menghindari warning runtime dan panel hero terpotong", () => {
    expect(source("components/badge-share-sheet.tsx")).not.toContain('pointerEvents="none"');
    expect(source("components/gradient-panel.tsx")).toContain('width: "100%"');
    expect(source("app/reminders.tsx")).not.toContain("Notifications.setNotificationHandler");
    expect(source("app/reminders.tsx")).toContain("UMKM KU di Android atau iPhone");
  });
});
