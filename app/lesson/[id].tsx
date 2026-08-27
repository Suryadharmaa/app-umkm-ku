import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { ScreenBack } from "@/components/screen-back";
import { ScreenContainer } from "@/components/screen-container";
import { lessons } from "@/lib/business-content";
import { useBusinessStore } from "@/lib/business-store";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessons.find((item) => item.id === id);
  const { completedLessons, completeLesson } = useBusinessStore();
  if (!lesson) return <ScreenContainer className="p-5"><ScreenBack title="Belajar" /><Text style={styles.notFound}>Materi tidak ditemukan.</Text></ScreenContainer>;
  const done = completedLessons.includes(lesson.id);
  function finish() { if (!lesson) return; completeLesson(lesson.id); router.replace("/services"); }
  return <ScreenContainer edges={["top", "bottom", "left", "right"]}><FlatList data={lesson.content} keyExtractor={(item, index) => `${item}-${index}`} contentContainerStyle={styles.list} ListHeaderComponent={<><ScreenBack title="Belajar" /><View style={styles.hero}><View style={styles.heroBadge}><MaterialIcons name="school" size={17} color="#514A98" /><Text style={styles.heroBadgeText}>{lesson.duration}</Text></View><Text style={styles.heroTitle}>{lesson.title}</Text><Text style={styles.heroText}>{lesson.summary}</Text></View><Text style={styles.heading}>Praktikkan satu per satu</Text><Text style={styles.subheading}>Langkah kecil yang konsisten lebih berguna daripada membaca semuanya sekaligus.</Text></>} renderItem={({ item, index }) => <View style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={styles.stepText}>{item}</Text></View>} ListFooterComponent={<View style={styles.footer}><AppButton label={done ? "Materi sudah selesai" : "Saya sudah memahami"} variant={done ? "secondary" : "primary"} icon={done ? "check" : "done-all"} onPress={finish} /><Text style={styles.footerText}>{done ? "Lanjutkan ke materi lain untuk menambah kebiasaan baik." : "Tandai selesai setelah Anda memahami atau mencoba materi ini."}</Text></View>} /></ScreenContainer>;
}
const styles = StyleSheet.create({ list: { padding: 20, paddingTop: 8, paddingBottom: 36 }, notFound: { color: "#14211F", fontSize: 16 }, hero: { borderRadius: 26, backgroundColor: "#ECEBFB", padding: 20 }, heroBadge: { alignSelf: "flex-start", flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, backgroundColor: "#FFFFFF" }, heroBadgeText: { color: "#514A98", fontSize: 12, fontWeight: "800" }, heroTitle: { color: "#272449", fontSize: 27, lineHeight: 33, fontWeight: "800", marginTop: 16 }, heroText: { color: "#5B5784", fontSize: 14, lineHeight: 21, marginTop: 8 }, heading: { color: "#14211F", fontSize: 20, lineHeight: 26, fontWeight: "800", marginTop: 26 }, subheading: { color: "#5E706B", fontSize: 14, lineHeight: 21, marginTop: 4 }, step: { flexDirection: "row", gap: 13, marginTop: 18 }, stepNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#ECEBFB", alignItems: "center", justifyContent: "center" }, stepNumberText: { color: "#514A98", fontSize: 13, fontWeight: "900" }, stepText: { flex: 1, color: "#14211F", fontSize: 16, lineHeight: 23 }, footer: { marginTop: 30 }, footerText: { color: "#73847E", fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 10 } });
