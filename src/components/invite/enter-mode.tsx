import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OtpInput } from "../ui/otp-input";
import { Button } from "../ui/button";

interface EnterModeProps {
  onBack: () => void;
  onSubmit: (code: string) => Promise<void>;
  loading: boolean;
}

export function EnterMode({ onBack, onSubmit, loading }: EnterModeProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError("El código debe tener 6 caracteres");
      return;
    }
    setError("");
    await onSubmit(trimmed);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 pb-12">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-accent/10 items-center justify-center mb-5">
            <Ionicons name="keypad-outline" size={32} color="#4F46E5" />
          </View>
          <Text className="text-3xl font-bold text-white mb-2">
            Ingresar código
          </Text>
          <Text className="text-muted-foreground text-center max-w-xs leading-5">
            Escribe el código de 6 caracteres que te dio tu pareja
          </Text>
        </View>

        <OtpInput
          value={code}
          onChangeText={(v) => {
            setCode(v);
            if (error) setError("");
          }}
          error={error}
        />

        <View className="mt-8">
          <Button
            title="Vincular"
            onPress={handleSubmit}
            loading={loading}
            disabled={code.length !== 6}
          />
        </View>

        <TouchableOpacity
          onPress={onBack}
          className="mt-6 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-muted-foreground text-sm">Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
