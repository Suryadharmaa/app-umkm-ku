import { useRef, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

let gradientIndex = 0;
export function GradientPanel({ children, style, colors = ["#173F73", "#2D6EAE"] }: { children: ReactNode; style?: StyleProp<ViewStyle>; colors?: [string, string] }) {
  const gradientId = useRef(`panel-gradient-${++gradientIndex}`).current;
  return <View style={[styles.container, style]}><Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none"><Defs><LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={colors[0]} /><Stop offset="1" stopColor={colors[1]} /></LinearGradient></Defs><Rect width="100%" height="100%" fill={`url(#${gradientId})`} /></Svg><View style={styles.content}>{children}</View></View>;
}
const styles = StyleSheet.create({ container: { width: "100%", alignSelf: "stretch", overflow: "hidden" }, content: { width: "100%", flexGrow: 1 } });
