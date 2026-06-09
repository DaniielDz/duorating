import { useState, useCallback } from "react";
import { View, Alert } from "react-native";
import { SearchBar } from "../../components/search/SearchBar";
import { SearchResults } from "../../components/search/SearchResults";
import { MediaTypeFilter } from "../../components/search/MediaTypeFilter";
import { DetailModal } from "../../components/search/DetailModal";
import { useSearch } from "../../hooks/useSearch";
import { useMediaDetails } from "../../hooks/useMediaDetails";
import { TMDBResult } from "../../lib/tmdb";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [selectedItem, setSelectedItem] = useState<TMDBResult | null>(null);

  const { results, loading, error } = useSearch(query, mediaType);
  const { data: details, loading: detailsLoading } = useMediaDetails(
    selectedItem?.id ?? null,
    selectedItem?.media_type ?? null,
  );

  const handlePress = useCallback((item: TMDBResult) => {
    setSelectedItem(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleAddToWatchlist = useCallback(() => {
    Alert.alert(
      "Agregado a pendientes",
      `${selectedItem && ("title" in selectedItem ? selectedItem.title : selectedItem.name)} se agregó a la lista.`,
    );
    setSelectedItem(null);
  }, [selectedItem]);

  const hasSearched = query.trim().length > 0;

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <SearchBar value={query} onChange={setQuery} loading={loading} />
        <View className="h-3" />
        <MediaTypeFilter value={mediaType} onChange={setMediaType} />
      </View>

      <SearchResults
        results={results}
        loading={loading}
        hasSearched={hasSearched}
        error={error}
        onPress={handlePress}
      />

      <DetailModal
        item={details}
        loading={detailsLoading}
        onClose={handleClose}
        onAddToWatchlist={handleAddToWatchlist}
      />
    </View>
  );
}
