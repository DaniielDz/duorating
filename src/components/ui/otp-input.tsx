import { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from "react-native";

interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChangeText,
  error,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.split("").concat(Array(length - value.length).fill(""));

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === "Backspace" && value.length > 0) {
        onChangeText(value.slice(0, -1));
      }
    },
    [value, onChangeText],
  );

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^A-Z0-9]/gi, "").toUpperCase();
      if (cleaned.length <= length) {
        onChangeText(cleaned);
      }
    },
    [length, onChangeText],
  );

  useEffect(() => {
    if (!focused && value.length === 0) return;
    if (focused) inputRef.current?.focus();
  }, [focused, value]);

  return (
    <View className="w-full items-center">
      <TouchableArea onPress={() => inputRef.current?.focus()}>
        <View className="flex-row gap-2.5 justify-center">
          {digits.map((digit, index) => {
            const isActive = focused && index === value.length;
            const isFilled = digit !== "";
            const borderColor = error
              ? "border-red-500"
              : isActive
                ? "border-accent"
                : isFilled
                  ? "border-accent/50"
                  : "border-line";

            return (
              <View
                key={index}
                className={`w-12 h-14 rounded-xl border-2 ${borderColor} items-center justify-center bg-surface-input`}
              >
                <Text
                  className={`text-2xl font-bold ${
                    isFilled ? "text-white" : "text-muted"
                  }`}
                >
                  {isActive ? "|" : digit || " "}
                </Text>
              </View>
            );
          })}
        </View>
      </TouchableArea>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute opacity-0 w-0 h-0"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={length}
        keyboardType={Platform.OS === "ios" ? "ascii-capable" : "visible-password"}
        caretHidden
      />

      {error && (
        <Text className="text-red-500 text-sm mt-3 text-center">{error}</Text>
      )}
    </View>
  );
}

function TouchableArea({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const { TouchableOpacity } = require("react-native");
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}
