import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface ChooseModeProps {
  onGenerate: () => void;
  onEnterCode: () => void;
  onSignOut: () => void;
  loading: boolean;
  error: string;
}

export function ChooseMode({
  onGenerate,
  onEnterCode,
  onSignOut,
  loading,
  error,
}: ChooseModeProps) {
  return (
    <View className="flex-1 px-6 pb-12 pt-32">
      <View className="items-center mb-12">
        <View className="w-16 h-16 rounded-2xl bg-accent/10 items-center justify-center mb-5">
          <Ionicons name="people" size={32} color="#4F46E5" />
        </View>
        <Text className="text-3xl font-bold text-white mb-2">
          Vincular Pareja
        </Text>
        <Text className="text-muted-foreground text-center max-w-xs leading-5">
          Conecta tu cuenta con tu pareja para compartir ratings y listas
        </Text>
      </View>

      {error ? (
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 flex-row items-center">
          <Ionicons name="alert-circle" size={18} color="#EF4444" />
          <Text className="text-red-400 text-sm ml-2 flex-1">{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={onGenerate}
        disabled={loading}
        activeOpacity={0.85}
        className="mb-4"
      >
        <LinearGradient
          colors={["#4F46E5", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-2xl p-5 flex-row items-center"
        >
          <View className="w-14 h-14 rounded-xl bg-white/15 items-center justify-center mr-4">
            <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              Generar código
            </Text>
            <Text className="text-blue-200 text-sm mt-0.5">
              Yo creo el código para mi pareja
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onEnterCode}
        disabled={loading}
        activeOpacity={0.85}
      >
        <View className="rounded-2xl p-5 flex-row items-center bg-surface-elevated border border-line/30">
          <View className="w-14 h-14 rounded-xl bg-accent/10 items-center justify-center mr-4">
            <Ionicons name="key-outline" size={28} color="#4F46E5" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              Ingresar código
            </Text>
            <Text className="text-muted-foreground text-sm mt-0.5">
              Tengo el código de mi pareja
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSignOut}
        disabled={loading}
        className="mt-auto items-center pt-8"
        activeOpacity={0.7}
      >
        <Text className="text-muted-foreground text-sm">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
