import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  loading = false,
  placeholder = "Buscar películas o series...",
}: SearchBarProps) {
  return (
    <View className="relative">
      <TextInput
        className="bg-gray-100 rounded-xl p-4 pr-12 text-base"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {loading ? (
        <ActivityIndicator
          className="absolute right-4 top-1/2"
          style={{ transform: [{ translateY: -10 }] }}
          color="#3B82F6"
        />
      ) : value.length > 0 ? (
        <TouchableOpacity
          className="absolute right-3 top-1/2 p-1"
          style={{ transform: [{ translateY: -10 }] }}
          onPress={() => onChange("")}
        >
          <View className="bg-gray-400 rounded-full w-5 h-5 items-center justify-center">
            <View className="w-2.5 h-0.5 bg-white rotate-45 absolute" />
            <View className="w-2.5 h-0.5 bg-white -rotate-45 absolute" />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
