import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandIcon } from "@/components/brand-assets";
import { AppButton } from "@/components/ui/app-button";
import { ScreenBack } from "@/components/screen-back";
import { ScreenContainer } from "@/components/screen-container";
import { type ExpenseCategory, type IncomeCategory, type TransactionCategory, useBusinessStore } from "@/lib/business-store";
import { useThemeContext } from "@/lib/theme-provider";

export default function AddTransactionScreen() {
  const { kind, quick } = useLocalSearchParams<{ kind?: "income" | "expense"; quick?: string }>();
  const isQuick = quick === "1";
  const [type, setType] = useState<"income" | "expense">(kind === "expense" ? "expense" : "income");
  const [category, setCategory] = useState<TransactionCategory>(kind === "expense" ? "Operasional" : "Penjualan");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showDetails, setShowDetails] = useState(!isQuick);
  const [error, setError] = useState("");
  const { addTransaction } = useBusinessStore();
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  const categoryItems = type === "income" ? (["Penjualan", "Jasa", "Pesanan khusus", "Lainnya"] as IncomeCategory[]) : (["Bahan baku", "Operasional", "Pemasaran", "Lainnya"] as ExpenseCategory[]);

  const changeType = (next: "income" | "expense") => {
    setType(next);
    setCategory(next === "income" ? "Penjualan" : "Operasional");
  };
  const save = () => {
    const numeric = Number(amount.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Masukkan nominal uang yang lebih dari nol.");
      return;
    }
    const transaction = addTransaction(type, numeric, note, category);
    router.replace({ pathname: "/(tabs)/money", params: { undo: transaction.id } });
  };

  return <ScreenContainer className="px-4 pt-2" edges={["top", "bottom", "left", "right"]}><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}><ScreenBack title={isQuick ? "Catat Cepat" : "Tambah Catatan"} /><View style={styles.info}><BrandIcon name="money" size={19} color="#2D6EAE" /><Text style={styles.infoText}>{isQuick ? "Masukkan nominal dahulu. Detail transaksi dapat ditambahkan bila diperlukan." : "Catatan ini hanya tersimpan di perangkat Anda."}</Text></View><Text style={[styles.label, dark && styles.textDark]}>Jenis transaksi</Text><View style={styles.types}><TypeCard label="Pemasukan" icon="transfer" selected={type === "income"} onPress={() => changeType("income")} /><TypeCard label="Pengeluaran" icon="money" selected={type === "expense"} onPress={() => changeType("expense")} /></View><Text style={[styles.label, dark && styles.textDark]}>Nominal</Text><View style={styles.amountBox}><Text style={styles.currency}>Rp</Text><TextInput autoFocus={isQuick} value={amount} onChangeText={(value) => { setAmount(value.replace(/[^0-9]/g, "")); setError(""); }} keyboardType="numeric" placeholder="0" placeholderTextColor="#A2B0BA" style={styles.amountInput} returnKeyType="done" onSubmitEditing={save} /></View>{error ? <Text style={styles.error}>{error}</Text> : null}{showDetails ? <><Text style={[styles.label, dark && styles.textDark]}>{type === "income" ? "Sumber pemasukan" : "Kategori pengeluaran"}</Text><View style={styles.categories}>{categoryItems.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.category, category === item && styles.categoryActive, pressed && styles.pressed]} accessibilityRole="radio" accessibilityState={{ selected: category === item }}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</View><Text style={[styles.label, dark && styles.textDark]}>Keterangan</Text><TextInput value={note} onChangeText={setNote} placeholder={type === "income" ? "Contoh: jual 10 porsi" : "Contoh: belanja bahan"} placeholderTextColor="#A2B0BA" style={styles.noteInput} returnKeyType="done" onSubmitEditing={save} /></> : <Pressable onPress={() => setShowDetails(true)} style={({ pressed }) => [styles.detailButton, dark && styles.detailButtonDark, pressed && styles.pressed]} accessibilityRole="button"><Text style={[styles.detailText, dark && styles.textDark]}>+ Tambahkan kategori atau keterangan</Text></Pressable>}<AppButton label={isQuick ? "Simpan cepat" : "Simpan catatan"} icon="check" onPress={save} style={styles.save} /></KeyboardAvoidingView></ScreenContainer>;
}

function TypeCard({ label, icon, selected, onPress }: { label: string; icon: "transfer" | "money"; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.type, selected && styles.typeSelected, pressed && styles.pressed]} accessibilityRole="button"><BrandIcon name={icon} size={18} color={selected ? "#2D6EAE" : "#8293A2"} /><Text style={[styles.typeText, selected && styles.typeTextSelected]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ info: { minHeight: 44, borderRadius: 13, backgroundColor: "#E6F3FA", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }, infoText: { color: "#55758E", fontSize: 11, fontWeight: "800", flex: 1 }, label: { color: "#344B62", fontSize: 13, fontWeight: "900", marginTop: 22, marginBottom: 8 }, types: { flexDirection: "row", gap: 9 }, type: { flex: 1, height: 48, borderRadius: 13, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }, typeSelected: { borderColor: "#2D6EAE", backgroundColor: "#EEF8FC" }, typeText: { color: "#718392", fontSize: 12, fontWeight: "900" }, typeTextSelected: { color: "#2D6EAE" }, categories: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, category: { borderRadius: 12, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 11, paddingVertical: 8 }, categoryActive: { borderColor: "#2D6EAE", backgroundColor: "#EEF8FC" }, categoryText: { color: "#718392", fontSize: 10, fontWeight: "800" }, categoryTextActive: { color: "#2D6EAE" }, amountBox: { height: 62, borderRadius: 16, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 9 }, currency: { color: "#2D6EAE", fontSize: 19, fontWeight: "900" }, amountInput: { flex: 1, color: "#29435B", fontSize: 22, fontWeight: "900", paddingVertical: 12, fontVariant: ["tabular-nums"] }, noteInput: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 14, color: "#29435B", fontSize: 15 }, detailButton: { minHeight: 42, borderRadius: 13, backgroundColor: "#F0F6FA", alignItems: "center", justifyContent: "center", marginTop: 14 }, detailButtonDark: { backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B54" }, detailText: { color: "#2D6EAE", fontSize: 11, fontWeight: "900" }, error: { color: "#B34A5A", fontSize: 11, fontWeight: "800", marginTop: 7 }, save: { marginTop: "auto", marginBottom: 8, paddingTop: 20 }, textDark: { color: "#FFFFFF" }, pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] } });
