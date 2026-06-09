import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const baseClasses = "w-full rounded-lg p-4 flex-row items-center justify-center";
  const variantClasses =
    variant === "primary"
      ? "bg-blue-500 active:bg-blue-600"
      : "bg-gray-200 active:bg-gray-300";
  const disabledClasses = disabled || loading ? "opacity-50" : "";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading && <ActivityIndicator color="#fff" className="mr-2" />}
      <Text
        className={`font-semibold text-base ${
          variant === "primary" ? "text-white" : "text-gray-700"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
