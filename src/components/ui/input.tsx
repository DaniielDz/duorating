import { useState } from "react";
import {
  TextInput,
  TextInputProps,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
}

export function Input({
  label,
  error,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? "border-red-500"
    : isFocused
    ? "border-accent"
    : "border-line";

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-sm font-medium text-muted-foreground mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-surface-input rounded-xl border ${borderColor}`}
      >
        <TextInput
          className={`flex-1 text-white text-base px-4 py-3.5 ${
            secureTextEntry ? "pr-12" : ""
          }`}
          placeholderTextColor="#6B7280"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            className="px-4 py-3.5"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-1.5 ml-1">{error}</Text>
      )}
    </View>
  );
}
