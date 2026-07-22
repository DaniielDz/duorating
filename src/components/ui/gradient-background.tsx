import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#0D0D1A", "#1A1A2E", "#0D0D1A"]}
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />
      <LinearGradient
        colors={[
          "rgba(79, 70, 229, 0.12)",
          "rgba(201, 149, 107, 0.04)",
          "transparent",
        ]}
        locations={[0, 0.35, 0.6]}
        className="absolute inset-0"
      />
      <View className="flex-1">{children}</View>
    </View>
  );
}
