import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/auth";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-3xl font-bold mb-2">Crear Cuenta</Text>
        <Text className="text-gray-500 mb-8">Únete y califica con tu pareja</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="new-password"
        />

        <Input
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="new-password"
        />

        {error ? (
          <Text className="text-red-500 text-sm mb-4 w-full">{error}</Text>
        ) : null}

        <Button
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
        />

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-6">
            <Text className="text-gray-500">
              ¿Ya tienes cuenta?{" "}
              <Text className="text-blue-500 font-semibold">Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
