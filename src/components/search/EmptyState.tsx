import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  variant: "idle" | "loading" | "error" | "no-results";
  message?: string;
}

const icons: Record<string, React.ReactNode> = {
  idle: <Ionicons name="search" size={48} color="#9CA3AF" />,
  loading: <Ionicons name="hourglass" size={48} color="#9CA3AF" />,
  error: <Ionicons name="alert-circle" size={48} color="#9CA3AF" />,
  "no-results": <MaterialCommunityIcons name="mailbox-open-outline" size={48} color="#9CA3AF" />,
};

const config = {
  idle: {
    title: "Busca películas y series",
    subtitle: "Escribe el nombre de una película o serie para empezar",
  },
  loading: {
    title: "Buscando...",
    subtitle: "Un momento, estamos buscando resultados",
  },
  error: {
    title: "Error de búsqueda",
    subtitle: "No pudimos completar la búsqueda. Intenta de nuevo.",
  },
  "no-results": {
    title: "Sin resultados",
    subtitle: "No encontramos nada con ese nombre. Prueba con otro término.",
  },
};

export function EmptyState({ variant, message }: EmptyStateProps) {
  const c = config[variant];

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4">{icons[variant]}</View>
      <Text className="text-lg font-semibold text-gray-700 text-center mb-2">
        {message || c.title}
      </Text>
      <Text className="text-sm text-gray-500 text-center leading-5">
        {c.subtitle}
      </Text>
    </View>
  );
}
