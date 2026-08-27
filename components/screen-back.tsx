import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeContext } from "@/lib/theme-provider";

export function ScreenBack({ title }: { title: string }) {
  const { colorScheme } = useThemeContext();
  const dark = colorScheme === "dark";
  return <View className="flex-row items-center gap-3 mb-5"><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, dark && styles.backDark, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Kembali"><Text style={styles.backText}>‹</Text></Pressable><Text style={[styles.title, dark && styles.titleDark]}>{title}</Text></View>;
}
const styles = StyleSheet.create({ back: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#E6F3FA" }, backDark: { backgroundColor: "#172235", borderWidth: 1, borderColor: "#2A3B54" }, backText: { color: "#2D6EAE", fontSize: 29, lineHeight: 31, fontWeight: "400" }, title: { color: "#29435B", fontSize: 20, lineHeight: 25, fontWeight: "900", letterSpacing: -0.25 }, titleDark: { color: "#FFFFFF" }, pressed: { opacity: 0.65, transform: [{ scale: 0.97 }] } });
