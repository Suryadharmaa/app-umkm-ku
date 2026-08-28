import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandIcon, type BrandIconName } from "@/components/brand-assets";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";
import { useBusinessStore } from "@/lib/business-store";

export default function TabLayout() {
  const colors = useColors();
  const { newsRead } = useBusinessStore();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 9 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;
  return <Tabs screenOptions={{ animation: "none", tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, headerShown: false, tabBarButton: HapticTab, tabBarLabelStyle: styles.label, tabBarItemStyle: styles.item, tabBarStyle: { paddingTop: 6, paddingBottom: bottomPadding, height: tabBarHeight, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 }, sceneStyle: { backgroundColor: colors.background } }}>
    <Tabs.Screen name="guide" options={{ title: "Panduan", tabBarIcon: ({ color }) => <TabIcon name="guide" color={String(color)} /> }} />
    <Tabs.Screen name="money" options={{ title: "Catat", tabBarIcon: ({ color }) => <TabIcon name="money" color={String(color)} /> }} />
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused }) => <HomeIcon focused={focused} /> }} />
    <Tabs.Screen name="news" options={{ title: "Kabar", tabBarIcon: ({ color }) => <KabarIcon color={String(color)} hasNew={!newsRead} /> }} />
    <Tabs.Screen name="services" options={{ title: "Layanan", tabBarIcon: ({ color }) => <TabIcon name="services" color={String(color)} /> }} />
  </Tabs>;
}
function TabIcon({ name, color }: { name: BrandIconName; color: string }) { return <BrandIcon name={name} size={20} color={color} />; }
function HomeIcon({ focused }: { focused: boolean }) { return <View style={[styles.homeIcon, focused && styles.homeIconFocused]}><BrandIcon name="home" size={20} color="#FFFFFF" /></View>; }
function KabarIcon({ color, hasNew }: { color: string; hasNew: boolean }) { return <View style={styles.kabarIcon}><BrandIcon name="bell" size={20} color={color} />{hasNew ? <View style={styles.badge}><View style={styles.badgeInner} /></View> : null}</View>; }
const styles = StyleSheet.create({ item: { minWidth: 0 }, label: { fontSize: 9, lineHeight: 11, fontWeight: "800", marginTop: 1 }, homeIcon: { width: 37, height: 37, marginTop: -12, borderRadius: 19, backgroundColor: "#4F8BC0", borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#244D87", shadowOpacity: 0.2, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 4 }, homeIconFocused: { backgroundColor: "#2D6EAE" }, kabarIcon: { width: 25, height: 25, alignItems: "center", justifyContent: "center" }, badge: { position: "absolute", top: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, badgeInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E35163" } });
