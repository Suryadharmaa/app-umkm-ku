import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { CashTransaction, ExpenseCategory } from "./business-store";

export async function sendBudgetThresholdAlert(category: ExpenseCategory, spent: number, budget: number) {
  if (Platform.OS === "web") return;
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") return;
  await Notifications.scheduleNotificationAsync({ content: { title: "Anggaran hampir mencapai batas", body: `${category} sudah memakai ${Math.round((spent / budget) * 100)}% dari anggaran bulan ini.` }, trigger: null });
}
