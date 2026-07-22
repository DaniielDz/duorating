import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const handlePress = onPress || (() => {});
  const isDisabled = disabled || loading;

  if (variant === "ghost") {
    return (
      <TouchableOpacity
        className={`w-full rounded-xl py-4 flex-row items-center justify-center border border-line ${
          isDisabled ? "opacity-50" : ""
        }`}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loading && <ActivityIndicator color="#9CA3AF" className="mr-2" />}
        <Text className="font-semibold text-base text-muted-foreground">
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`w-full rounded-xl ${isDisabled ? "opacity-50" : ""}`}
    >
      <LinearGradient
        colors={["#4F46E5", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-full rounded-xl py-4 flex-row items-center justify-center"
      >
        {loading && <ActivityIndicator color="#FFFFFF" className="mr-2" />}
        <Text className="font-bold text-base text-white">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
