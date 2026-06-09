import { TouchableOpacity, Text, View, Image } from "react-native";
import { tmdb, TMDBResult } from "../../lib/tmdb";

interface MediaCardProps {
  item: TMDBResult;
  onPress: () => void;
}

function getYear(item: TMDBResult): string {
  if (item.media_type === "movie") {
    return item.release_date?.split("-")[0] || "";
  }
  return item.first_air_date?.split("-")[0] || "";
}

function getTitle(item: TMDBResult): string {
  return item.media_type === "movie" ? item.title : item.name;
}

export function MediaCard({ item, onPress }: MediaCardProps) {
  const posterUrl = item.poster_path
    ? tmdb.getPosterUrl(item.poster_path, "w200")
    : null;

  return (
    <TouchableOpacity
      className="flex-1 rounded-xl overflow-hidden bg-gray-100 active:opacity-80"
      onPress={onPress}
    >
      {posterUrl ? (
        <Image
          source={{ uri: posterUrl }}
          className="w-full aspect-[2/3]"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full aspect-[2/3] items-center justify-center bg-gray-200">
          <Text className="text-gray-400 text-3xl">🎬</Text>
        </View>
      )}
      <View className="px-2 py-2">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
          {getTitle(item)}
        </Text>
        {getYear(item) ? (
          <Text className="text-xs text-gray-500 mt-0.5">{getYear(item)}</Text>
        ) : null}
      </View>
      <View className="absolute top-2 left-2">
        <View
          className={`px-2 py-0.5 rounded-full ${
            item.media_type === "movie" ? "bg-blue-500" : "bg-purple-500"
          }`}
        >
          <Text className="text-white text-xs font-medium">
            {item.media_type === "movie" ? "Película" : "Serie"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
