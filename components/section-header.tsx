import { Text, View } from "react-native";

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return <View className="flex-row items-center justify-between mb-3"><Text className="text-lg font-bold text-foreground">{title}</Text>{action ? <Text className="text-sm font-semibold text-primary">{action}</Text> : null}</View>;
}
