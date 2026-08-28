import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

import { BrandIcon } from "@/components/brand-assets";
import { AppButton } from "@/components/ui/app-button";
import { ScreenBack } from "@/components/screen-back";
import { ScreenContainer } from "@/components/screen-container";
import { type MonthCloseStep, useBusinessStore } from "@/lib/business-store";
import { formatRupiah, getMonthlyCloseReadiness, getMonthlySummary, monthKey } from "@/lib/business-utils";
import { exportFinancialReport } from "@/lib/report-export";
import { useThemeContext } from "@/lib/theme-provider";
import { buildUmkmKuReport } from "@/lib/umkmku-report-template";

const steps: { id: MonthCloseStep; title: string; text: string }[] = [
  { id: "records", title: "Tinjau catatan", text: "Pastikan pemasukan dan pengeluaran bulan ini sudah benar." },
  { id: "budget", title: "Tinjau anggaran", text: "Pastikan setidaknya satu batas anggaran usaha telah diatur." },
  { id: "export", title: "Simpan laporan", text: "Ekspor laporan PDF setelah seluruh angka Anda periksa." },
];

export default function MonthlyCloseScreen() {
  const { transactions, budgets, profile, monthlyCloseProgress, closedMonths, toggleMonthlyCloseStep, setMonthClosed } = useBusinessStore();
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  const [exporting, setExporting] = useState(false);
  const month = useMemo(() => new Date(), []);
  const key = monthKey(month);
  const summary = getMonthlySummary(transactions, month);
  const completedSteps = monthlyCloseProgress[key] ?? [];
  const budgetCount = Object.values(budgets).filter((value) => (value ?? 0) > 0).length;
  const readiness = getMonthlyCloseReadiness({ transactionCount: summary.transactions.length, budgetCount, completedSteps });
  const complete = readiness.completed === steps.length;
  const closed = closedMonths.includes(key);

  const exportReport = async (languageOrEvent: "id" | "en" | GestureResponderEvent = "id") => {
    if (typeof languageOrEvent !== "string") {
      Alert.alert("Bahasa laporan", "Pilih bahasa untuk laporan keuangan yang akan diekspor.", [{ text: "Batal", style: "cancel" }, { text: "Indonesia", onPress: () => { void exportReport("id"); } }, { text: "English", onPress: () => { void exportReport("en"); } }]);
      return;
    }
    setExporting(true);
    try {
      await exportFinancialReport({ monthLabel: summary.monthLabel, profile, makeHtml: (printProfile) => buildUmkmKuReport({ monthLabel: summary.monthLabel, transactions: summary.transactions, income: summary.totals.income, expense: summary.totals.expense, profile: printProfile, language: languageOrEvent }) });
      if (!completedSteps.includes("export")) toggleMonthlyCloseStep(key, "export");
    } catch {
      Alert.alert("Ekspor belum berhasil", "Coba ulangi setelah memastikan aplikasi diizinkan membuka pilihan simpan file.");
    } finally {
      setExporting(false);
    }
  };
  const toggleStep = (step: MonthCloseStep) => {
    if (step === "records" && summary.transactions.length === 0) { Alert.alert("Belum ada catatan", "Tambahkan setidaknya satu transaksi sebelum meninjau tutup buku."); return; }
    if (step === "budget" && budgetCount === 0) { Alert.alert("Atur anggaran dahulu", "Tambahkan minimal satu batas anggaran agar kontrol pengeluaran dapat ditinjau.", [{ text: "Nanti", style: "cancel" }, { text: "Atur anggaran", onPress: () => router.push("/budget") }]); return; }
    if (step === "export") { void exportReport("id"); return; }
    toggleMonthlyCloseStep(key, step);
  };
  const closeMonth = () => {
    if (!complete) return;
    setMonthClosed(key, !closed);
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={s.content}>
    <ScreenBack title="Tutup Buku Bulanan" />
    <View style={[s.hero, dark && s.heroDark]}><View style={[s.heroIcon, dark && s.iconDark]}><BrandIcon name="activity" size={24} color="#2D6EAE" /></View><Text style={[s.heroTitle, dark && s.textDark]}>{closed ? "Buku bulan ini sudah ditutup." : "Rapikan bulan usaha Anda."}</Text><Text style={[s.heroText, dark && s.textDark]}>Selesaikan tiga langkah singkat untuk meninjau catatan, anggaran, dan laporan {summary.monthLabel}.</Text><View style={s.heroProgress}><View style={[s.heroProgressFill, { width: `${(readiness.completed / steps.length) * 100}%` }]} /></View><Text style={s.heroProgressText}>{readiness.completed} dari {steps.length} langkah selesai</Text></View>
    <View style={[s.summary, dark && s.cardDark]}><View><Text style={[s.summaryLabel, dark && s.textDark]}>SALDO BULAN INI</Text><Text style={[s.summaryValue, dark && s.textDark]}>{formatRupiah(summary.totals.balance)}</Text></View><View style={s.summaryCount}><Text style={s.summaryCountValue}>{summary.transactions.length}</Text><Text style={s.summaryCountLabel}>catatan</Text></View></View>
    <Text style={[s.heading, dark && s.textDark]}>Checklist penutupan</Text>
    {steps.map((step, index) => { const done = completedSteps.includes(step.id); const available = step.id === "records" ? summary.transactions.length > 0 : step.id === "budget" ? budgetCount > 0 : true; return <Pressable key={step.id} onPress={() => toggleStep(step.id)} style={({ pressed }) => [s.step, dark && s.cardDark, done && s.stepDone, pressed && s.pressed]} accessibilityRole="checkbox" accessibilityState={{ checked: done, disabled: !available && step.id !== "export" }}><View style={[s.stepNumber, done && s.stepNumberDone]}><Text style={[s.stepNumberText, done && s.stepNumberTextDone]}>{done ? "✓" : index + 1}</Text></View><View style={s.grow}><Text style={[s.stepTitle, dark && s.textDark]}>{step.title}</Text><Text style={[s.stepText, dark && s.textDark]}>{step.text}</Text>{!available && step.id !== "export" ? <Text style={s.stepWarning}>{step.id === "records" ? "Tambahkan transaksi untuk melanjutkan." : "Atur anggaran untuk melanjutkan."}</Text> : null}</View><BrandIcon name="arrow" size={17} color={done ? "#2E8C67" : "#2D6EAE"} /></Pressable>; })}
    <Pressable disabled={!complete} onPress={closeMonth} style={({ pressed }) => [s.closeButton, (!complete || closed) && s.closeButtonComplete, !complete && s.disabled, pressed && s.pressed]} accessibilityRole="button"><Text style={s.closeButtonText}>{closed ? "Buka kembali checklist bulan ini" : complete ? "Tandai buku bulan ini selesai" : "Selesaikan checklist untuk menutup buku"}</Text></Pressable>
    <View style={[s.footer, dark && s.cardDark]}><Text style={[s.footerTitle, dark && s.textDark]}>Laporan siap dibagikan</Text><Text style={[s.footerText, dark && s.textDark]}>Gunakan laporan PDF untuk evaluasi internal, diskusi dengan pendamping usaha, atau arsip pribadi.</Text><AppButton label={exporting ? "Menyiapkan laporan…" : "Ekspor laporan PDF"} icon="share" onPress={exportReport} style={s.exportButton} /></View>
  </ScrollView></ScreenContainer>;
}

const s = StyleSheet.create({ content: { padding: 16, paddingTop: 8, paddingBottom: 36 }, grow: { flex: 1 }, hero: { borderRadius: 19, backgroundColor: "#EAF5FB", padding: 16 }, heroDark: { backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B54" }, heroIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, iconDark: { backgroundColor: "#101827" }, heroTitle: { color: "#29435B", fontSize: 18, fontWeight: "900", marginTop: 12 }, heroText: { color: "#587286", fontSize: 12, lineHeight: 18, marginTop: 5 }, heroProgress: { height: 7, borderRadius: 4, backgroundColor: "#C5DCEB", overflow: "hidden", marginTop: 18 }, heroProgressFill: { height: "100%", borderRadius: 4, backgroundColor: "#2E8C67" }, heroProgressText: { color: "#2D6EAE", fontSize: 10, fontWeight: "900", marginTop: 7 }, summary: { minHeight: 76, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E9ED", marginTop: 11, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, summaryLabel: { color: "#718292", fontSize: 8, fontWeight: "900", letterSpacing: .7 }, summaryValue: { color: "#29435B", fontSize: 20, fontWeight: "900", marginTop: 4 }, summaryCount: { minWidth: 49, borderRadius: 12, backgroundColor: "#E6F3FA", paddingVertical: 8, alignItems: "center" }, summaryCountValue: { color: "#2D6EAE", fontSize: 15, fontWeight: "900" }, summaryCountLabel: { color: "#2D6EAE", fontSize: 8, fontWeight: "800" }, heading: { color: "#29435B", fontSize: 15, fontWeight: "900", marginTop: 22, marginBottom: 8 }, step: { minHeight: 78, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E9ED", padding: 11, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 }, stepDone: { backgroundColor: "#F1FAF6", borderColor: "#A6D8C3" }, stepNumber: { width: 29, height: 29, borderRadius: 10, backgroundColor: "#E6F3FA", alignItems: "center", justifyContent: "center" }, stepNumberDone: { backgroundColor: "#2E8C67" }, stepNumberText: { color: "#2D6EAE", fontSize: 12, fontWeight: "900" }, stepNumberTextDone: { color: "#FFFFFF" }, stepTitle: { color: "#29435B", fontSize: 12, fontWeight: "900" }, stepText: { color: "#718292", fontSize: 9, lineHeight: 13, marginTop: 3 }, stepWarning: { color: "#B47A17", fontSize: 8, fontWeight: "800", marginTop: 4 }, closeButton: { minHeight: 50, borderRadius: 15, backgroundColor: "#2E8C67", alignItems: "center", justifyContent: "center", paddingHorizontal: 15, marginTop: 5 }, closeButtonComplete: { backgroundColor: "#2D6EAE" }, closeButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", textAlign: "center" }, footer: { borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E9ED", padding: 13, marginTop: 20 }, footerTitle: { color: "#29435B", fontSize: 13, fontWeight: "900" }, footerText: { color: "#718292", fontSize: 10, lineHeight: 15, marginTop: 4 }, exportButton: { marginTop: 13 }, cardDark: { backgroundColor: "#172235", borderColor: "#2A3B54" }, textDark: { color: "#FFFFFF" }, disabled: { opacity: .5 }, pressed: { opacity: .82, transform: [{ scale: .985 }] } });
