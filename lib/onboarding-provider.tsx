import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandIcon, type BrandIconName } from "@/components/brand-assets";

const ONBOARDING_KEY = "umkm-ku-onboarding-complete";
type TourContextValue = { restartTour: () => void };
const TourContext = createContext<TourContextValue | null>(null);
const steps: { icon: BrandIconName; overline: string; title: string; text: string; route?: string; action?: string }[] = [
  { icon: "capital", overline: "PRIORITAS 1 DARI 6", title: "Lengkapi Profil Usaha", text: "Masukkan nama usaha, nama pemilik, dan logo agar laporan keuangan terasa milik usaha Anda.", route: "/business-profile", action: "Lengkapi profil" },
  { icon: "money", overline: "PRIORITAS 2 DARI 6", title: "Catat setiap transaksi", text: "Mulai dari pemasukan atau pengeluaran pertama. Catatan rutin membuat saldo dan analitik lebih akurat.", route: "/add-transaction?kind=income", action: "Catat pemasukan" },
  { icon: "scan", overline: "PRIORITAS 3 DARI 6", title: "Simpan QRIS usaha", text: "Unggah QRIS agar pelanggan mudah membayar dan kode selalu siap ditampilkan.", route: "/qris", action: "Atur QRIS" },
  { icon: "activity", overline: "PRIORITAS 4 DARI 6", title: "Pantau kesehatan usaha", text: "Gunakan analitik untuk melihat arus kas, mengatur batas anggaran, dan mengenali pengeluaran penting.", route: "/analytics", action: "Buka analitik" },
  { icon: "share", overline: "PRIORITAS 5 DARI 6", title: "Simpan laporan PDF", text: "Ekspor ringkasan bulanan saat Anda membutuhkan dokumentasi pembukuan usaha.", route: "/analytics", action: "Lihat laporan" },
  { icon: "guide", overline: "PRIORITAS 6 DARI 6", title: "Sesuaikan aplikasi", text: "Atur tema, ukuran teks, dan minat agar UMKM KU nyaman digunakan setiap hari.", route: "/preferences", action: "Buka pengaturan" },
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false); const [visible, setVisible] = useState(false); const [index, setIndex] = useState(0);
  useEffect(() => { void AsyncStorage.getItem(ONBOARDING_KEY).then((done) => { setVisible(done !== "true"); setReady(true); }); }, []);
  const finish = useCallback(() => { setVisible(false); void AsyncStorage.setItem(ONBOARDING_KEY, "true"); }, []);
  const restartTour = useCallback(() => { setIndex(0); setVisible(true); void AsyncStorage.removeItem(ONBOARDING_KEY); }, []);
  const value = useMemo(() => ({ restartTour }), [restartTour]); const step = steps[index];
  const next = () => { if (index === steps.length - 1) finish(); else setIndex((current) => current + 1); };
  const go = () => { if (step.route) router.push(step.route as never); next(); };
  return <TourContext.Provider value={value}>{children}{ready ? <Modal visible={visible} transparent animationType="fade" onRequestClose={finish}><View style={styles.backdrop}><View style={styles.sheet}><View style={styles.progress}>{steps.map((_, item) => <View key={item} style={[styles.progressBar, item <= index && styles.progressBarActive]} />)}</View><View style={styles.icon}><BrandIcon name={step.icon} size={28} color="#2D6EAE" /></View><Text style={styles.overline}>{step.overline}</Text><Text style={styles.title}>{step.title}</Text><Text style={styles.text}>{step.text}</Text><View style={styles.footer}><Pressable onPress={finish} style={styles.skip}><Text style={styles.skipText}>Lewati tutorial</Text></Pressable>{step.route ? <Pressable onPress={go} style={styles.primary}><Text style={styles.primaryText}>{step.action}</Text><BrandIcon name="arrow" size={15} color="#FFFFFF" /></Pressable> : null}<Pressable onPress={next} style={styles.next}><Text style={styles.nextText}>{index === steps.length - 1 ? "Selesai" : "Lanjut"}</Text></Pressable></View></View></View></Modal> : null}</TourContext.Provider>;
}
export function useOnboarding() { const context = useContext(TourContext); if (!context) throw new Error("useOnboarding must be used within OnboardingProvider"); return context; }
const styles = StyleSheet.create({ backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(8, 18, 32, 0.58)", padding: 16 }, sheet: { borderRadius: 24, backgroundColor: "#FFFFFF", padding: 20 }, progress: { flexDirection: "row", gap: 5 }, progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#E3EAF0" }, progressBarActive: { backgroundColor: "#2D6EAE" }, icon: { width: 56, height: 56, borderRadius: 19, backgroundColor: "#E6F3FA", alignItems: "center", justifyContent: "center", marginTop: 20 }, overline: { color: "#2D6EAE", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, marginTop: 17 }, title: { color: "#29435B", fontSize: 22, lineHeight: 27, fontWeight: "900", marginTop: 5 }, text: { color: "#64778A", fontSize: 13, lineHeight: 19, marginTop: 8 }, footer: { marginTop: 22, gap: 9 }, primary: { minHeight: 46, borderRadius: 14, backgroundColor: "#2D6EAE", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, next: { minHeight: 42, borderRadius: 14, backgroundColor: "#EAF5FB", alignItems: "center", justifyContent: "center" }, nextText: { color: "#2D6EAE", fontSize: 13, fontWeight: "900" }, skip: { alignSelf: "center", paddingVertical: 3 }, skipText: { color: "#7A8995", fontSize: 11, fontWeight: "800" } });
