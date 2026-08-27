import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Animated, Platform, StyleSheet } from "react-native";
import { useRef } from "react";

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => Animated.timing(scale, { toValue, duration: toValue < 1 ? 90 : 150, useNativeDriver: true }).start();
  return <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}><PlatformPressable {...props} onPressIn={(event) => { animate(0.93); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); props.onPressIn?.(event); }} onPressOut={(event) => { animate(1); props.onPressOut?.(event); }} /></Animated.View>;
}
const styles = StyleSheet.create({ wrapper: { flex: 1 } });
