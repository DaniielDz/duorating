import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/auth";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";

export default function CoupleSettingsScreen() {
  const { user, couple, signOut, refreshCouple } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUnlink = () => {
    Alert.alert(
      "Desvincular pareja",
      "¿Estás seguro? Se perderá el acceso a las calificaciones compartidas con esta pareja.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desvincular",
          style: "destructive",
          onPress: performUnlink,
        },
      ]
    );
  };

  const performUnlink = async () => {
    if (!couple) return;
    setLoading(true);

    const { error } = await supabase
      .from("couples")
      .delete()
      .eq("id", couple.id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    await refreshCouple();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-lg">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Ajustes de Pareja</Text>
        <View className="w-16" />
      </View>

      <View className="p-6">
        <View className="bg-gray-50 rounded-xl p-5 mb-6">
          <Text className="text-sm text-gray-500 mb-1">Tu cuenta</Text>
          <Text className="text-base font-medium">{user?.email}</Text>
        </View>

        {couple && (
          <View className="bg-gray-50 rounded-xl p-5 mb-6">
            <Text className="text-sm text-gray-500 mb-1">Código de invitación</Text>
            <Text className="text-lg font-mono font-bold tracking-wider">
              {couple.invite_code}
            </Text>
          </View>
        )}

        <View className="bg-gray-50 rounded-xl p-5 mb-6">
          <Text className="text-sm text-gray-500 mb-1">Pareja vinculada</Text>
          <Text className="text-base font-medium">
            {couple
              ? couple.user_1_id === user?.id
                ? "Vinculado (cuenta #2)"
                : "Vinculado (cuenta #1)"
              : "Sin pareja"}
          </Text>
        </View>

        <Button
          title="Desvincular pareja"
          onPress={handleUnlink}
          loading={loading}
          variant="secondary"
        />

        <TouchableOpacity className="mt-6 py-3" onPress={signOut}>
          <Text className="text-red-500 text-center font-semibold">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
