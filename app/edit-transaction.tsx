import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandIcon } from "@/components/brand-assets";
import { AppButton } from "@/components/ui/app-button";
import { ScreenBack } from "@/components/screen-back";
import { ScreenContainer } from "@/components/screen-container";
import { type ExpenseCategory, type IncomeCategory, type TransactionCategory, useBusinessStore } from "@/lib/business-store";
import { useThemeContext } from "@/lib/theme-provider";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { transactions, hydrated, updateTransaction, duplicateTransaction, removeTransaction } = useBusinessStore();
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  const transaction = useMemo(() => transactions.find((item) => item.id === id), [id, transactions]);
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState<TransactionCategory>("Penjualan");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!transaction) return;
    setType(transaction.type);
    setCategory(transaction.category ?? (transaction.type === "income" ? "Penjualan" : "Operasional"));
    setAmount(String(transaction.amount));
    setNote(transaction.note);
  }, [transaction]);

  const categories = type === "income" ? (["Penjualan", "Jasa", "Pesanan khusus", "Lainnya"] as IncomeCategory[]) : (["Bahan baku", "Operasional", "Pemasaran", "Lainnya"] as ExpenseCategory[]);
  const save = () => {
    if (!transaction) return;
    const numeric = Number(amount.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Masukkan nominal uang yang lebih dari nol.");
      return;
    }
    updateTransaction(transaction.id, { type, amount: numeric, note, category });
    router.replace("/(tabs)/money");
  };
  const duplicate = () => {
    if (!transaction) return;
    const duplicated = duplicateTransaction(transaction.id);
    if (duplicated) router.replace(`/edit-transaction?id=${duplicated.id}` as never);
  };
  const remove = () => {
    if (!transaction) return;
    Alert.alert("Hapus catatan?", "Catatan ini akan dihapus dari laporan dan saldo usaha.", [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: () => { removeTransaction(transaction.id); router.replace("/(tabs)/money"); } }]);
  };

  if (!hydrated) return <ScreenContainer><View style={s.loading}><Text style={[s.loadingText, dark && s.textDark]}>Menyiapkan catatan…</Text></View></ScreenContainer>;
  if (!transaction) return <ScreenContainer><View style={s.loading}><Text style={[s.loadingText, dark && s.textDark]}>Catatan tidak ditemukan atau sudah dihapus.</Text><AppButton label="Kembali ke Catat Uang" icon="arrow-back" onPress={() => router.replace("/(tabs)/money")} style={s.backButton} /></View></ScreenContainer>;

  return <ScreenContainer className="px-4 pt-2" edges={["top", "bottom", "left", "right"]}><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><ScreenBack title="Koreksi Catatan" /><View style={s.info}><BrandIcon name="activity" size={18} color="#2D6EAE" /><Text style={s.infoText}>Perubahan akan langsung memperbarui saldo dan laporan.</Text></View><Text style={[s.label, dark && s.textDark]}>Jenis transaksi</Text><View style={s.types}>{(["income", "expense"] as const).map((item) => <Pressable key={item} onPress={() => { setType(item); setCategory(item === "income" ? "Penjualan" : "Operasional"); }} style={({ pressed }) => [s.type, type === item && s.typeActive, pressed && s.pressed]} accessibilityRole="radio" accessibilityState={{ selected: type === item }}><Text style={[s.typeText, type === item && s.typeTextActive]}>{item === "income" ? "Pemasukan" : "Pengeluaran"}</Text></Pressable>)}</View><Text style={[s.label, dark && s.textDark]}>{type === "income" ? "Sumber pemasukan" : "Kategori pengeluaran"}</Text><View style={s.categories}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={({ pressed }) => [s.category, category === item && s.categoryActive, pressed && s.pressed]} accessibilityRole="radio" accessibilityState={{ selected: category === item }}><Text style={[s.categoryText, category === item && s.categoryTextActive]}>{item}</Text></Pressable>)}</View><Text style={[s.label, dark && s.textDark]}>Nominal</Text><View style={s.amountBox}><Text style={s.currency}>Rp</Text><TextInput value={amount} onChangeText={(value) => { setAmount(value.replace(/[^0-9]/g, "")); setError(""); }} keyboardType="numeric" placeholder="0" placeholderTextColor="#A2B0BA" style={s.amountInput} returnKeyType="done" /></View>{error ? <Text style={s.error}>{error}</Text> : null}<Text style={[s.label, dark && s.textDark]}>Keterangan</Text><TextInput value={note} onChangeText={setNote} placeholder="Keterangan transaksi" placeholderTextColor="#A2B0BA" style={s.noteInput} returnKeyType="done" onSubmitEditing={save} /><AppButton label="Simpan perubahan" icon="check" onPress={save} style={s.save} /><View style={s.secondaryActions}><Pressable onPress={duplicate} style={({ pressed }) => [s.duplicate, pressed && s.pressed]} accessibilityRole="button"><Text style={s.duplicateText}>Duplikat sebagai catatan baru</Text></Pressable><Pressable onPress={remove} style={({ pressed }) => [s.remove, pressed && s.pressed]} accessibilityRole="button"><Text style={s.removeText}>Hapus catatan</Text></Pressable></View></ScrollView></KeyboardAvoidingView></ScreenContainer>;
}

const s = StyleSheet.create({
  content: { paddingBottom: 26 }, loading: { flex: 1, padding: 26, alignItems: "center", justifyContent: "center" }, loadingText: { color: "#29435B", fontSize: 13, fontWeight: "800", textAlign: "center" }, backButton: { marginTop: 14 },
  info: { minHeight: 44, borderRadius: 13, backgroundColor: "#E6F3FA", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }, infoText: { color: "#55758E", fontSize: 11, fontWeight: "800", flex: 1 },
  label: { color: "#344B62", fontSize: 13, fontWeight: "900", marginTop: 22, marginBottom: 8 }, types: { flexDirection: "row", gap: 9 }, type: { flex: 1, minHeight: 47, borderRadius: 13, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, typeActive: { borderColor: "#2D6EAE", backgroundColor: "#EEF8FC", borderWidth: 2 }, typeText: { color: "#718392", fontSize: 12, fontWeight: "900" }, typeTextActive: { color: "#2D6EAE" },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, category: { borderRadius: 12, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 11, paddingVertical: 8 }, categoryActive: { borderColor: "#2D6EAE", backgroundColor: "#EEF8FC" }, categoryText: { color: "#718392", fontSize: 10, fontWeight: "800" }, categoryTextActive: { color: "#2D6EAE" },
  amountBox: { height: 62, borderRadius: 16, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 9 }, currency: { color: "#2D6EAE", fontSize: 19, fontWeight: "900" }, amountInput: { flex: 1, color: "#29435B", fontSize: 22, fontWeight: "900", paddingVertical: 12, fontVariant: ["tabular-nums"] }, noteInput: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: "#DFE7EC", backgroundColor: "#FFFFFF", paddingHorizontal: 14, color: "#29435B", fontSize: 15 }, error: { color: "#B34A5A", fontSize: 11, fontWeight: "800", marginTop: 7 },
  save: { marginTop: 22 }, secondaryActions: { flexDirection: "row", gap: 9, marginTop: 10 }, duplicate: { flex: 1, minHeight: 44, borderRadius: 13, backgroundColor: "#E6F3FA", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 }, duplicateText: { color: "#2D6EAE", fontSize: 10, fontWeight: "900", textAlign: "center" }, remove: { flex: 1, minHeight: 44, borderRadius: 13, backgroundColor: "#FCE8EB", alignItems: "center", justifyContent: "center" }, removeText: { color: "#B34A5A", fontSize: 10, fontWeight: "900" }, textDark: { color: "#FFFFFF" }, pressed: { opacity: .8, transform: [{ scale: .985 }] },
});
