import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandIcon } from "@/components/brand-assets";
import { AppButton } from "@/components/ui/app-button";
import { ScreenBack } from "@/components/screen-back";
import { ScreenContainer } from "@/components/screen-container";
import { backupFilename, createEncryptedBusinessBackup, decryptEncryptedBusinessBackup, inspectEncryptedBusinessBackup, type BackupHeader } from "@/lib/business-backup";
import { useBusinessStore } from "@/lib/business-store";
import { useThemeContext } from "@/lib/theme-provider";

type RestoreCandidate = { serialized: string; header: BackupHeader };

function formatDate(value: string | null) {
  if (!value) return "Belum pernah dibuat";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Belum pernah dibuat" : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function readWebFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function BackupScreen() {
  const { createBackupSnapshot, restoreFromBackup, markBackupCompleted, transactions, profile, lastBackupAt } = useBusinessStore();
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  const [exportPassword, setExportPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [candidate, setCandidate] = useState<RestoreCandidate | null>(null);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const createBackup = async () => {
    if (exportPassword !== confirmPassword) {
      setMessage("Konfirmasi kata sandi belum sama.");
      return;
    }
    setProcessing(true);
    setMessage("");
    try {
      const backup = await createEncryptedBusinessBackup(createBackupSnapshot(), exportPassword);
      const filename = backupFilename(new Date(backup.createdAt));
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(new Blob([backup.serialized], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const uri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(uri, backup.serialized, { encoding: FileSystem.EncodingType.UTF8 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { dialogTitle: "Simpan backup UMKM KU", mimeType: "application/json", UTI: "public.json" });
        }
      }
      markBackupCompleted(backup.createdAt);
      setExportPassword("");
      setConfirmPassword("");
      setMessage("Backup terenkripsi telah dibuat. Simpan berkas dan kata sandinya di tempat aman.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Backup belum dapat dibuat. Coba lagi.");
    } finally {
      setProcessing(false);
    }
  };

  const chooseBackup = async () => {
    setMessage("");
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain", "*/*"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const serialized = Platform.OS === "web" && asset.file ? await readWebFile(asset.file as File) : await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
      setCandidate({ serialized, header: inspectEncryptedBusinessBackup(serialized) });
      setRestorePassword("");
    } catch (error) {
      setCandidate(null);
      setMessage(error instanceof Error ? error.message : "Berkas backup belum dapat dibaca.");
    }
  };

  const confirmRestore = () => {
    if (!candidate) return;
    Alert.alert("Pulihkan data usaha?", "Data lokal saat ini akan diganti setelah kata sandi backup berhasil diverifikasi.", [
      { text: "Batal", style: "cancel" },
      { text: "Pulihkan data", style: "destructive", onPress: () => { void restoreBackup(); } },
    ]);
  };

  const restoreBackup = async () => {
    if (!candidate) return;
    setProcessing(true);
    setMessage("");
    try {
      const backup = await decryptEncryptedBusinessBackup(candidate.serialized, restorePassword);
      await restoreFromBackup(backup.data);
      setCandidate(null);
      setRestorePassword("");
      setMessage("Data backup telah dipulihkan. Pengingat perangkat dan foto QRIS/logo perlu diatur kembali demi keamanan lintas perangkat.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pemulihan data belum berhasil.");
    } finally {
      setProcessing(false);
    }
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <ScreenBack title="Cadangan & Pemulihan" />
    <View style={[s.hero, dark && s.cardDark]}><View style={[s.heroIcon, dark && s.iconDark]}><BrandIcon name="share" size={24} color="#2D6EAE" /></View><Text style={[s.heroTitle, dark && s.textDark]}>Data usaha tetap milik Anda.</Text><Text style={[s.heroText, dark && s.textDark]}>Buat file backup yang terkunci kata sandi sebelum ganti perangkat atau melakukan pembaruan besar.</Text></View>
    <View style={[s.status, dark && s.cardDark]}><View><Text style={[s.statusLabel, dark && s.textDark]}>BACKUP TERAKHIR</Text><Text style={[s.statusValue, dark && s.textDark]}>{formatDate(lastBackupAt)}</Text></View><View style={s.count}><Text style={s.countValue}>{transactions.length}</Text><Text style={s.countLabel}>catatan</Text></View></View>
    <Text style={[s.heading, dark && s.textDark]}>Buat backup terenkripsi</Text>
    <View style={[s.card, dark && s.cardDark]}><Text style={[s.cardTitle, dark && s.textDark]}>Lindungi dengan kata sandi</Text><Text style={[s.cardText, dark && s.textDark]}>Kata sandi tidak disimpan oleh UMKM KU. Tanpanya, file backup tidak dapat dibuka.</Text><TextInput value={exportPassword} onChangeText={setExportPassword} placeholder="Kata sandi minimal 8 karakter" placeholderTextColor="#8EA0AF" secureTextEntry style={s.input} returnKeyType="next" /><TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Ulangi kata sandi" placeholderTextColor="#8EA0AF" secureTextEntry style={[s.input, s.inputLast]} returnKeyType="done" onSubmitEditing={() => { void createBackup(); }} /><Pressable disabled={processing} onPress={() => { void createBackup(); }} style={({ pressed }) => [s.primary, processing && s.disabled, pressed && s.pressed]} accessibilityRole="button"><Text style={s.primaryText}>{processing ? "Menyiapkan backup…" : "Buat & simpan backup"}</Text><BrandIcon name="share" size={18} color="#FFFFFF" /></Pressable></View>
    <Text style={[s.privacy, dark && s.textDark]}>Untuk menjaga ukuran file dan mencegah tautan perangkat rusak, foto QRIS, logo usaha, serta jadwal notifikasi perangkat tidak disertakan. Data usaha, pembukuan, anggaran, panduan, Kabar, dan pencapaian tetap dicadangkan.</Text>
    <Text style={[s.heading, dark && s.textDark]}>Pulihkan backup</Text>
    <View style={[s.card, dark && s.cardDark]}>{!candidate ? <><Text style={[s.cardTitle, dark && s.textDark]}>Periksa sebelum mengganti data</Text><Text style={[s.cardText, dark && s.textDark]}>Pilih file .umkmku yang sebelumnya Anda buat. Isi file akan diperiksa sebelum dapat dipulihkan.</Text><AppButton label="Pilih file backup" icon="folder-open" variant="secondary" onPress={() => { void chooseBackup(); }} style={s.button} /></> : <><Text style={[s.restoreLabel, dark && s.textDark]}>BACKUP SIAP DIPULIHKAN</Text><Text style={[s.cardTitle, dark && s.textDark]}>{candidate.header.businessName}</Text><Text style={[s.cardText, dark && s.textDark]}>{candidate.header.transactionCount} catatan · dibuat {formatDate(candidate.header.createdAt)}</Text><TextInput value={restorePassword} onChangeText={setRestorePassword} placeholder="Masukkan kata sandi backup" placeholderTextColor="#8EA0AF" secureTextEntry style={[s.input, s.inputLast]} returnKeyType="done" /><Pressable disabled={processing || !restorePassword} onPress={confirmRestore} style={({ pressed }) => [s.danger, (processing || !restorePassword) && s.disabled, pressed && s.pressed]} accessibilityRole="button"><Text style={s.primaryText}>{processing ? "Memverifikasi…" : "Verifikasi & pulihkan"}</Text></Pressable><Pressable onPress={() => setCandidate(null)} style={({ pressed }) => [s.change, pressed && s.pressed]} accessibilityRole="button"><Text style={[s.changeText, dark && s.textDark]}>Pilih file lain</Text></Pressable></>}</View>
    {message ? <View style={[s.message, dark && s.messageDark]}><Text style={[s.messageText, dark && s.textDark]}>{message}</Text></View> : null}
    <Text style={[s.footer, dark && s.textDark]}>Profil saat ini: {profile.businessName}</Text>
  </ScrollView></ScreenContainer>;
}

const s = StyleSheet.create({ content: { padding: 16, paddingTop: 8, paddingBottom: 36 }, hero: { borderRadius: 19, backgroundColor: "#EEF7FC", borderWidth: 1, borderColor: "#D5E7F1", padding: 16 }, heroIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, iconDark: { backgroundColor: "#101827" }, heroTitle: { color: "#29435B", fontSize: 18, fontWeight: "900", marginTop: 12 }, heroText: { color: "#587286", fontSize: 12, lineHeight: 18, marginTop: 5 }, status: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 76, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E9ED", paddingHorizontal: 13, marginTop: 11 }, statusLabel: { color: "#718292", fontSize: 8, fontWeight: "900", letterSpacing: .7 }, statusValue: { color: "#29435B", fontSize: 11, fontWeight: "800", marginTop: 5, maxWidth: 230 }, count: { minWidth: 48, borderRadius: 12, backgroundColor: "#E6F3FA", paddingVertical: 8, alignItems: "center" }, countValue: { color: "#2D6EAE", fontSize: 15, fontWeight: "900" }, countLabel: { color: "#2D6EAE", fontSize: 8, fontWeight: "800", marginTop: 1 }, heading: { color: "#29435B", fontSize: 15, fontWeight: "900", marginTop: 22, marginBottom: 8 }, card: { borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E9ED", padding: 13 }, cardDark: { backgroundColor: "#172235", borderColor: "#2A3B54" }, cardTitle: { color: "#29435B", fontSize: 13, fontWeight: "900" }, cardText: { color: "#718292", fontSize: 10, lineHeight: 15, marginTop: 5 }, input: { height: 49, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D7E4EC", color: "#29435B", paddingHorizontal: 13, fontSize: 13, marginTop: 12 }, inputLast: { marginTop: 8, marginBottom: 11 }, primary: { minHeight: 48, borderRadius: 14, backgroundColor: "#2D6EAE", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, danger: { minHeight: 48, borderRadius: 14, backgroundColor: "#B34A5A", alignItems: "center", justifyContent: "center" }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, button: { marginTop: 13 }, privacy: { color: "#718292", fontSize: 10, lineHeight: 15, marginTop: 9, paddingHorizontal: 3 }, restoreLabel: { color: "#2D6EAE", fontSize: 8, fontWeight: "900", letterSpacing: .6, marginBottom: 6 }, change: { minHeight: 38, alignItems: "center", justifyContent: "center", marginTop: 5 }, changeText: { color: "#2D6EAE", fontSize: 11, fontWeight: "900" }, message: { borderRadius: 14, backgroundColor: "#E8F3E5", padding: 11, marginTop: 14 }, messageDark: { backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B54" }, messageText: { color: "#2E6F56", fontSize: 11, lineHeight: 16, fontWeight: "700" }, footer: { color: "#718292", fontSize: 10, textAlign: "center", marginTop: 20 }, textDark: { color: "#FFFFFF" }, disabled: { opacity: .55 }, pressed: { opacity: .82, transform: [{ scale: .985 }] } });
