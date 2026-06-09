import { View, FlatList } from "react-native";
import { TMDBResult } from "../../lib/tmdb";
import { MediaCard } from "./MediaCard";
import { EmptyState } from "./EmptyState";

const NUM_COLUMNS = 3;

interface SearchResultsProps {
  results: TMDBResult[];
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
  onPress: (item: TMDBResult) => void;
}

function getCardStyle(index: number) {
  const gutter = 4;
  return {
    width: `${100 / NUM_COLUMNS}%` as const,
    paddingLeft: index % NUM_COLUMNS === 0 ? 0 : gutter,
    paddingRight: index % NUM_COLUMNS === NUM_COLUMNS - 1 ? 0 : gutter,
    paddingBottom: gutter * 2,
  };
}

export function SearchResults({
  results,
  loading,
  hasSearched,
  error,
  onPress,
}: SearchResultsProps) {
  if (!hasSearched) {
    return <EmptyState variant="idle" />;
  }

  if (loading && results.length === 0) {
    return <EmptyState variant="loading" />;
  }

  if (error) {
    return <EmptyState variant="error" message={error} />;
  }

  if (!loading && results.length === 0) {
    return <EmptyState variant="no-results" />;
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => `${item.media_type}-${item.id}`}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={{ padding: 8, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <View style={getCardStyle(index)}>
          <MediaCard item={item} onPress={() => onPress(item)} />
        </View>
      )}
    />
  );
}
