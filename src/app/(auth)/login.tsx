import { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/auth";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
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
        <Text className="text-3xl font-bold mb-2">DuoRating</Text>
        <Text className="text-gray-500 mb-8">Califica películas con tu pareja</Text>

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
          autoComplete="password"
        />

        {error ? (
          <Text className="text-red-500 text-sm mb-4 w-full">{error}</Text>
        ) : null}

        <Button
          title="Iniciar Sesión"
          onPress={handleLogin}
          loading={loading}
        />

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity className="mt-6">
            <Text className="text-gray-500">
              ¿No tienes cuenta?{" "}
              <Text className="text-blue-500 font-semibold">Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
