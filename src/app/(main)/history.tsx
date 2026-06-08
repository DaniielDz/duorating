import { View, Text } from "react-native";

export default function HistoryScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold">Historial</Text>
      <Text className="text-gray-500 mt-2">No hay películas calificadas</Text>
    </View>
  );
}
