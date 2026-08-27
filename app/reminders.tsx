import * as Notifications from "expo-notifications";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { BrandIcon } from "@/components/brand-assets";
import { ScreenBack } from "@/components/screen-back";
import { ScreenContainer } from "@/components/screen-container";
import { type BusinessDeadline, useBusinessStore } from "@/lib/business-store";
import { useThemeContext } from "@/lib/theme-provider";

const hours = [18, 19, 20];

export default function RemindersScreen() {
  const { reminderHour, reminderNotificationId, saveReminder, deadlines, addDeadline, removeDeadline } = useBusinessStore();
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  const [kind, setKind] = useState<BusinessDeadline["kind"]>("Pajak");
  const [dueDate, setDueDate] = useState("");

  const permission = async () => {
    if (Platform.OS === "web") return false;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("business-reminder", { name: "Pengingat usaha", importance: Notifications.AndroidImportance.DEFAULT });
    }
    const current = await Notifications.getPermissionsAsync();
    const status = current.status === "granted" ? current.status : (await Notifications.requestPermissionsAsync()).status;
    return status === "granted";
  };

  const schedule = async (hour: number) => {
    if (Platform.OS === "web") {
      Alert.alert("Pengingat tersedia di aplikasi mobile", "Notifikasi harian akan berjalan saat Anda memakai UMKM KU di Android atau iPhone.");
      return;
    }
    if (!(await permission())) {
      Alert.alert("Izin diperlukan", "Aktifkan notifikasi untuk menerima pengingat pencatatan.");
      return;
    }
    if (reminderNotificationId) await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: "Catat transaksi usaha", body: "Luangkan sebentar untuk mencatat pemasukan atau pengeluaran hari ini." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
    });
    saveReminder(hour, id);
  };

  const disable = async () => {
    if (reminderNotificationId && Platform.OS !== "web") await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
    saveReminder(null, null);
  };

  const addDue = async () => {
    const date = new Date(`${dueDate}T09:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      Alert.alert("Tanggal belum tepat", "Masukkan tanggal masa depan dengan format YYYY-MM-DD.");
      return;
    }
    let notificationId: string | null = null;
    if (Platform.OS !== "web" && await permission()) {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: { title: `Tenggat ${kind}`, body: `Hari ini adalah tenggat ${kind.toLowerCase()} usaha Anda.` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
    addDeadline(kind, dueDate, notificationId);
    setDueDate("");
  };

  const removeDue = async (deadline: BusinessDeadline) => {
    if (deadline.notificationId && Platform.OS !== "web") await Notifications.cancelScheduledNotificationAsync(deadline.notificationId);
    removeDeadline(deadline.id);
  };

  return <ScreenContainer className="px-4 pt-2" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <ScreenBack title="Pengingat Usaha" />
    <View style={[styles.hero, dark && styles.surfaceDark]}>
      <View style={[styles.heroIcon, dark && styles.iconDark]}><BrandIcon name="bell" size={26} color="#5E315D" /></View>
      <Text style={[styles.heroTitle, dark && styles.textDark]}>Jangan lewatkan pencatatan atau tenggat penting.</Text>
      <Text style={[styles.heroText, dark && styles.textDark]}>Buat pengingat transaksi harian serta tenggat pajak dan legalitas usaha dari satu tempat.</Text>
    </View>
    <Text style={[styles.heading, dark && styles.textDark]}>Pengingat transaksi harian</Text>
    <View style={styles.hours}>{hours.map((hour) => <Pressable key={hour} onPress={() => schedule(hour)} style={({ pressed }) => [styles.hour, dark && styles.cardDark, reminderHour === hour && styles.hourActive, dark && reminderHour === hour && styles.hourActiveDark, pressed && styles.pressed]} accessibilityRole="radio" accessibilityState={{ selected: reminderHour === hour }}>
      <Text style={[styles.hourValue, dark && styles.textDark, reminderHour === hour && styles.hourValueActive, dark && reminderHour === hour && styles.textDark]}>{`${String(hour).padStart(2, "0")}:00`}</Text>
      <Text style={[styles.hourLabel, dark && styles.textDark, reminderHour === hour && styles.hourLabelActive, dark && reminderHour === hour && styles.textDark]}>Setiap hari</Text>
    </Pressable>)}</View>
    {reminderHour ? <View style={[styles.active, dark && styles.activeDark]}>
      <View style={[styles.activeIcon, dark && styles.iconDark]}><BrandIcon name="bell" size={18} color="#2E8C67" /></View>
      <View className="flex-1"><Text style={[styles.activeTitle, dark && styles.textDark]}>Pengingat aktif pukul {`${String(reminderHour).padStart(2, "0")}:00`}</Text><Text style={[styles.activeText, dark && styles.textDark]}>Anda akan menerima pengingat untuk mencatat transaksi harian.</Text></View>
      <Pressable onPress={disable} style={({ pressed }) => [styles.disable, dark && styles.iconDark, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.disableText}>Matikan</Text></Pressable>
    </View> : null}
    <Text style={[styles.heading, dark && styles.textDark]}>Tambahkan tenggat penting</Text>
    <View style={styles.kinds}>{(["Pajak", "Izin usaha"] as BusinessDeadline["kind"][]).map((item) => <Pressable key={item} onPress={() => setKind(item)} style={({ pressed }) => [styles.kind, dark && styles.cardDark, kind === item && styles.kindActive, dark && kind === item && styles.hourActiveDark, pressed && styles.pressed]} accessibilityRole="radio" accessibilityState={{ selected: kind === item }}><Text style={[styles.kindText, dark && styles.textDark, kind === item && styles.kindTextActive, dark && kind === item && styles.textDark]}>{item}</Text></Pressable>)}</View>
    <View style={styles.dateRow}><TextInput value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={dark ? "#FFFFFF" : "#AA9A9A"} style={[styles.dateInput, dark && styles.cardDark, dark && styles.textDark]} returnKeyType="done" /><Pressable onPress={addDue} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.addText}>Tambah</Text></Pressable></View>
    <Text style={[styles.dateHint, dark && styles.textDark]}>Notifikasi akan dikirim pukul 09.00 pada tanggal tenggat.</Text>
    {deadlines.length ? <View style={styles.deadlineList}>{deadlines.map((deadline) => <View key={deadline.id} style={[styles.deadline, dark && styles.cardDark]}><View style={[styles.deadlineIcon, dark && styles.iconDark]}><BrandIcon name={deadline.kind === "Pajak" ? "money" : "permit"} size={17} color="#B47A17" /></View><View className="flex-1"><Text style={[styles.deadlineTitle, dark && styles.textDark]}>{deadline.kind}</Text><Text style={[styles.deadlineText, dark && styles.textDark]}>Tenggat {new Date(`${deadline.dueDate}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</Text></View><Pressable onPress={() => removeDue(deadline)} style={({ pressed }) => [styles.removeButton, dark && styles.iconDark, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.removeText}>Hapus</Text></Pressable></View>)}</View> : <View style={[styles.empty, dark && styles.cardDark]}><Text style={[styles.emptyText, dark && styles.textDark]}>Belum ada tenggat pajak atau izin yang ditambahkan.</Text></View>}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 }, hero: { borderRadius: 18, backgroundColor: "#FFF0D6", padding: 16 }, surfaceDark: { backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B54" }, heroIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, iconDark: { backgroundColor: "#101827" }, heroTitle: { color: "#3A1F3D", fontSize: 17, lineHeight: 23, fontWeight: "900", marginTop: 12 }, heroText: { color: "#7E6D72", fontSize: 12, lineHeight: 18, marginTop: 5 }, heading: { color: "#3A1F3D", fontSize: 14, fontWeight: "900", marginTop: 22, marginBottom: 8 }, hours: { flexDirection: "row", gap: 8 }, hour: { flex: 1, minHeight: 72, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F0E5D4", alignItems: "center", justifyContent: "center" }, cardDark: { backgroundColor: "#172235", borderColor: "#2A3B54" }, hourActive: { borderColor: "#F0B93D", backgroundColor: "#FFF8EE", borderWidth: 2 }, hourActiveDark: { backgroundColor: "#285B95", borderColor: "#73B7F1" }, hourValue: { color: "#3A1F3D", fontSize: 17, fontWeight: "900" }, hourValueActive: { color: "#5E315D" }, hourLabel: { color: "#7E6D72", fontSize: 9, marginTop: 3 }, hourLabelActive: { color: "#5E315D", fontWeight: "800" }, active: { marginTop: 12, backgroundColor: "#E8F3E5", borderRadius: 15, padding: 12, flexDirection: "row", alignItems: "center", gap: 9 }, activeDark: { backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B54" }, activeIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, activeTitle: { color: "#2E8C67", fontSize: 11, fontWeight: "900" }, activeText: { color: "#52766C", fontSize: 9, lineHeight: 13, marginTop: 3 }, disable: { minHeight: 31, borderRadius: 12, backgroundColor: "#FFFFFF", paddingHorizontal: 9, alignItems: "center", justifyContent: "center" }, disableText: { color: "#B34A5A", fontSize: 9, fontWeight: "900" }, kinds: { flexDirection: "row", gap: 8 }, kind: { flex: 1, minHeight: 39, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F0E5D4", alignItems: "center", justifyContent: "center" }, kindActive: { backgroundColor: "#FFF8EE", borderColor: "#F0B93D", borderWidth: 2 }, kindText: { color: "#7E6D72", fontSize: 11, fontWeight: "900" }, kindTextActive: { color: "#5E315D" }, dateRow: { flexDirection: "row", gap: 8, marginTop: 9 }, dateInput: { flex: 1, height: 46, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F0E5D4", paddingHorizontal: 12, color: "#3A1F3D", fontSize: 13, fontWeight: "800" }, addButton: { minWidth: 74, height: 46, borderRadius: 14, backgroundColor: "#5E315D", alignItems: "center", justifyContent: "center" }, addText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" }, dateHint: { color: "#927F85", fontSize: 9, lineHeight: 13, marginTop: 6 }, deadlineList: { gap: 8, marginTop: 12 }, deadline: { minHeight: 64, borderRadius: 14, backgroundColor: "#FFF6E4", padding: 10, flexDirection: "row", alignItems: "center", gap: 9 }, deadlineIcon: { width: 33, height: 33, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, deadlineTitle: { color: "#986018", fontSize: 11, fontWeight: "900" }, deadlineText: { color: "#83682E", fontSize: 9, marginTop: 3 }, removeButton: { height: 29, borderRadius: 11, backgroundColor: "#FFFFFF", paddingHorizontal: 8, alignItems: "center", justifyContent: "center" }, removeText: { color: "#B34A5A", fontSize: 9, fontWeight: "900" }, empty: { marginTop: 12, borderRadius: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F0E5D4", padding: 12 }, emptyText: { color: "#7E6D72", fontSize: 10 }, textDark: { color: "#FFFFFF" }, pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
