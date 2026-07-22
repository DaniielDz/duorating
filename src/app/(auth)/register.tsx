import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/auth";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Logo } from "../../components/ui/logo";
import { GradientBackground } from "../../components/ui/gradient-background";
import { useToast } from "../../components/ui/Toast";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Email o contraseña incorrectos",
  "Email not confirmed": "Confirma tu email antes de iniciar sesión",
  "User already registered": "Ya existe una cuenta con ese email",
};

function mapSupabaseError(message: string): string {
  return ERROR_MESSAGES[message] || "Ocurrió un error. Intenta de nuevo";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmError("");

    if (!email.trim()) {
      setEmailError("El email es obligatorio");
      valid = false;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Ingresa un email válido");
      valid = false;
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError("Confirma tu contraseña");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Las contraseñas no coinciden");
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await signUp(email.trim(), password);
    setLoading(false);

    if (result.error) {
      const friendlyMessage = mapSupabaseError(result.error);
      setEmailError(friendlyMessage);
      showToast("error", friendlyMessage);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8 pb-12 pt-20">
          <View className="items-center mb-12">
            <Logo size="sm" />
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError("");
            }}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError || undefined}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (passwordError) setPasswordError("");
            }}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
            error={passwordError || undefined}
          />

          <Input
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (confirmError) setConfirmError("");
            }}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
            error={confirmError || undefined}
          />

          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
          />

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="mt-8 items-center" activeOpacity={0.7}>
              <Text className="text-muted-foreground text-sm">
                ¿Ya tienes cuenta?{" "}
                <Text className="text-accent font-semibold">Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
