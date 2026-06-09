import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/auth";
import { supabase } from "../../lib/supabase";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function LinkScreen() {
  const { user, refreshCouple, signOut } = useAuth();
  const [mode, setMode] = useState<"choose" | "waiting" | "enter">("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "waiting" || !inviteCode) return;

    const channel = supabase
      .channel("couple-wait")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "couples",
          filter: `invite_code=eq.${inviteCode}`,
        },
        async () => {
          await refreshCouple();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, inviteCode]);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);

    const code = generateCode();
    const { error: dbError } = await supabase.from("couples").insert({
      user_1_id: user!.id,
      invite_code: code,
    });

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setInviteCode(code);
    setMode("waiting");
  };

  const handleEnterCode = async () => {
    setError("");
    const code = inputCode.trim().toUpperCase();

    if (code.length !== 6) {
      setError("El código debe tener 6 caracteres");
      return;
    }

    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("couples")
      .select("*")
      .eq("invite_code", code)
      .is("user_2_id", null)
      .maybeSingle();

    if (fetchError || !data) {
      setLoading(false);
      setError("Código no válido o ya fue usado");
      return;
    }

    console.log("Updating couple row with ID:", data.id, "setting user_2_id:", user!.id);
    const { error: updateError } = await supabase
      .from("couples")
      .update({ user_2_id: user!.id })
      .eq("id", data.id);

    setLoading(false);

    if (updateError) {
      console.error("Update error:", updateError);
      setError(updateError.message);
      return;
    }

    console.log("Update successful, calling refreshCouple...");
    await refreshCouple();
    console.log("refreshCouple finished");
  };

  if (mode === "waiting") {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-2xl font-bold mb-4">Comparte este código</Text>
        <Text className="text-gray-500 mb-6 text-center">
          Pásale este código a tu pareja para vincularse
        </Text>
        <View className="bg-gray-100 rounded-xl px-8 py-6 mb-6">
          <Text className="text-4xl font-mono font-bold tracking-widest text-center">
            {inviteCode}
          </Text>
        </View>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text className="text-gray-400 mt-3">Esperando a tu pareja...</Text>
        <TouchableOpacity className="mt-8" onPress={() => setMode("choose")}>
          <Text className="text-blue-500">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === "choose") {
    return (
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-2xl font-bold mb-2">Vincular Pareja</Text>
        <Text className="text-gray-500 mb-8 text-center">
          ¿Cómo quieres vincularte?
        </Text>

        {error ? (
          <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>
        ) : null}

        <TouchableOpacity
          className={`w-full bg-blue-500 rounded-xl p-5 mb-4 flex-row items-center justify-center ${
            loading ? "opacity-50" : ""
          }`}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View>
              <Text className="text-white text-center font-semibold text-lg">
                Generar código
              </Text>
              <Text className="text-blue-100 text-center text-sm mt-1">
                Yo creo el código para mi pareja
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-gray-100 rounded-xl p-5"
          onPress={() => {
            setError("");
            setMode("enter");
          }}
          disabled={loading}
        >
          <Text className="text-gray-800 text-center font-semibold text-lg">
            Ingresar código
          </Text>
          <Text className="text-gray-500 text-center text-sm mt-1">
            Tengo el código de mi pareja
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-8"
          onPress={signOut}
          disabled={loading}
        >
          <Text className="text-gray-400">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center bg-white p-6">
        <Text className="text-2xl font-bold mb-2">Ingresar código</Text>
        <Text className="text-gray-500 mb-8 text-center">
          Escribe el código de 6 caracteres que te dio tu pareja
        </Text>

        <Input
          value={inputCode}
          onChangeText={setInputCode}
          placeholder="ABC123"
          autoCapitalize="characters"
          maxLength={6}
        />

        {error ? (
          <Text className="text-red-500 text-sm mb-4 w-full">{error}</Text>
        ) : null}

        <Button
          title="Vincular"
          onPress={handleEnterCode}
          loading={loading}
        />

        <TouchableOpacity className="mt-6" onPress={() => setMode("choose")}>
          <Text className="text-gray-500">Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
