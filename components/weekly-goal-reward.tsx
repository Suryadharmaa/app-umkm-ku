import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useBusinessStore } from "@/lib/business-store";
import { weeklyRewardKey, weeklyTransactionCount } from "@/lib/progress-utils";
import { useProgressStore } from "@/lib/progress-store";

export function WeeklyGoalReward() {
  const { transactions, hydrated } = useBusinessStore(); const { target, recordAchievement } = useProgressStore();
  useEffect(() => { if (!hydrated || weeklyTransactionCount(transactions) < target) return; const key = weeklyRewardKey(); if (!recordAchievement({ weekKey: key, target, achievedAt: new Date().toISOString() })) return; if (Platform.OS === "web") return; void (async () => { const existing = await Notifications.getPermissionsAsync(); const permission = existing.status === "granted" ? existing : await Notifications.requestPermissionsAsync(); if (permission.status === "granted") await Notifications.scheduleNotificationAsync({ content: { title: "Target mingguan tercapai", body: `Hebat! Anda sudah mencatat ${target} transaksi minggu ini. Pembukuan usaha semakin rapi.` }, trigger: null }); })(); }, [hydrated, recordAchievement, target, transactions]);
  return null;
}
