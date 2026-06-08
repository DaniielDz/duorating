import { View, Text } from "react-native";

export default function WatchlistScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold">Pendientes</Text>
      <Text className="text-gray-500 mt-2">No hay contenido pendiente</Text>
    </View>
  );
}
