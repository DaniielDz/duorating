import { View, Text, TextInput } from "react-native";

export default function SearchScreen() {
  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Buscar</Text>
      <TextInput
        className="bg-gray-100 rounded-lg p-4 mb-4"
        placeholder="Buscar películas o series..."
      />
    </View>
  );
}
