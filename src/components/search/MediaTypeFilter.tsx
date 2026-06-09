import { View, Text, TouchableOpacity } from "react-native";

type MediaType = "all" | "movie" | "tv";

interface MediaTypeFilterProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

const options: { value: MediaType; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "movie", label: "Películas" },
  { value: "tv", label: "Series" },
];

export function MediaTypeFilter({ value, onChange }: MediaTypeFilterProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-xl p-1">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
           className={`flex-1 py-2 rounded-lg items-center ${
             value === opt.value ? "bg-white" : ""
           }`}
          onPress={() => onChange(opt.value)}
        >
          <Text
            className={`text-sm font-medium ${
              value === opt.value ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
