import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, type GestureResponderEvent, type StyleProp, type ViewStyle } from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "dark";

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  compact = false,
  style,
}: {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = buttonThemes[variant];
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.button, compact && styles.compact, theme.container, pressed && styles.pressed, style]} accessibilityRole="button"><Text style={[styles.label, compact && styles.compactLabel, { color: theme.text }]}>{label}</Text>{icon ? <MaterialIcons name={icon} size={compact ? 18 : 20} color={theme.text} /> : null}</Pressable>;
}

const buttonThemes = {
  primary: { container: { backgroundColor: "#2D6EAE" }, text: "#FFFFFF" },
  secondary: { container: { backgroundColor: "#E6F3FA" }, text: "#2D6EAE" },
  outline: { container: { backgroundColor: "#FFFFFF", borderColor: "#D7E4EC", borderWidth: 1.25 }, text: "#29435B" },
  dark: { container: { backgroundColor: "#173F73" }, text: "#FFFFFF" },
};

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  compact: { minHeight: 42, borderRadius: 13, paddingHorizontal: 14 },
  label: { fontSize: 16, fontWeight: "800", lineHeight: 20 },
  compactLabel: { fontSize: 14 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
