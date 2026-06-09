import { View, Text } from "react-native";

interface EmptyStateProps {
  variant: "idle" | "loading" | "error" | "no-results";
  message?: string;
}

const config = {
  idle: {
    icon: "🔍",
    title: "Busca películas y series",
    subtitle: "Escribe el nombre de una película o serie para empezar",
  },
  loading: {
    icon: "⏳",
    title: "Buscando...",
    subtitle: "Un momento, estamos buscando resultados",
  },
  error: {
    icon: "⚠️",
    title: "Error de búsqueda",
    subtitle: "No pudimos completar la búsqueda. Intenta de nuevo.",
  },
  "no-results": {
    icon: "📭",
    title: "Sin resultados",
    subtitle: "No encontramos nada con ese nombre. Prueba con otro término.",
  },
};

export function EmptyState({ variant, message }: EmptyStateProps) {
  const c = config[variant];

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">{c.icon}</Text>
      <Text className="text-lg font-semibold text-gray-700 text-center mb-2">
        {message || c.title}
      </Text>
      <Text className="text-sm text-gray-500 text-center leading-5">
        {c.subtitle}
      </Text>
    </View>
  );
}
