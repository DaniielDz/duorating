import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { tmdb, TMDBMovieDetails, TMDBTVDetails, TMDBTVSeasonDetails, TMDBWatchProviderItem } from "../../lib/tmdb";

type MediaDetails = TMDBMovieDetails | TMDBTVDetails;

interface DetailModalProps {
  item: MediaDetails | null;
  loading: boolean;
  onClose: () => void;
  onAddToWatchlist: () => void;
}

function isMovie(d: MediaDetails): d is TMDBMovieDetails {
  return "title" in d;
}

function isTV(d: MediaDetails): d is TMDBTVDetails {
  return "name" in d;
}

function getTitle(d: MediaDetails): string {
  return isMovie(d) ? d.title : d.name;
}

function getYear(d: MediaDetails): string {
  if (isMovie(d)) {
    return d.release_date?.split("-")[0] || "";
  }
  return d.first_air_date?.split("-")[0] || "";
}

export function DetailModal({
  item,
  loading,
  onClose,
  onAddToWatchlist,
}: DetailModalProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<Record<string, TMDBTVSeasonDetails>>({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [providers, setProviders] = useState<TMDBWatchProviderItem[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    setExpandedSeason(null);
    setSeasonData({});
    setLoadingSeason(null);
    setProviders([]);

    if (!item) return;

    const mediaType = "title" in item ? "movie" : "tv";
    let cancelled = false;

    setLoadingProviders(true);
    tmdb.getWatchProviders(mediaType, item.id)
      .then((res) => {
        if (cancelled) return;
        const country = res.results["MX"] ?? res.results["US"];
        setProviders(country?.flatrate ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingProviders(false);
      });

    return () => { cancelled = true; };
  }, [item?.id]);

  const toggleSeason = async (seasonNumber: number, tvId: number) => {
    const key = `${tvId}-${seasonNumber}`;
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }
    setExpandedSeason(seasonNumber);
    if (!seasonData[key]) {
      setLoadingSeason(seasonNumber);
      try {
        const data = await tmdb.getSeasonDetails(tvId, seasonNumber);
        setSeasonData((prev) => ({ ...prev, [key]: data }));
      } catch {
        // ignore
      } finally {
        setLoadingSeason(null);
      }
    }
  };

  return (
    <Modal
      visible={!!item || loading}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {loading ? (
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-400">Cargando...</Text>
        </View>
      ) : item ? (
        <View className="flex-1 bg-white">
          <ScrollView
            className="flex-1"
            bounces={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="relative h-56">
              {item.backdrop_path ? (
                <Image
                  source={{ uri: tmdb.getBackdropUrl(item.backdrop_path, "w780") }}
                  className="w-full h-56"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-56 bg-gray-800 items-center justify-center">
                  <Text className="text-5xl">🎬</Text>
                </View>
              )}
              <View className="absolute inset-0 bg-black/30" />
            </View>

            <TouchableOpacity
              className="absolute top-12 right-4 z-10 bg-black/50 rounded-full w-8 h-8 items-center justify-center"
              onPress={onClose}
            >
              <Text className="text-white text-lg font-bold">✕</Text>
            </TouchableOpacity>

            <View className="px-5 -mt-16">
              <View className="flex-row">
                {item.poster_path ? (
                  <Image
                    source={{ uri: tmdb.getPosterUrl(item.poster_path, "w500") }}
                    className="w-32 h-44 rounded-xl border-4 border-white"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-32 h-44 rounded-xl border-4 border-white bg-gray-200 items-center justify-center">
                    <Text className="text-3xl">🎬</Text>
                  </View>
                )}
                <View className="flex-1 ml-4 justify-end pb-1.5">
                  <Text
                    className="text-2xl font-bold tracking-tight text-gray-900 leading-tight"
                    numberOfLines={2}
                  >
                    {getTitle(item)}
                  </Text>
                  <View className="flex-row items-center">
                    {getYear(item) ? (
                      <Text className="text-md text-gray-500">{getYear(item)}</Text>
                    ) : null}
                    {item.vote_average ? (
                      <>
                        <Text className="text-md text-gray-400 mx-1.5">•</Text>
                        <Text className="text-md font-medium text-yellow-600">
                          ★ {item.vote_average.toFixed(1)}
                        </Text>
                      </>
                    ) : null}
                  </View>

                  {isMovie(item) ? (
                    item.runtime ? (
                      <View className="flex-row items-center mt-2">
                        <View className="bg-blue-50 rounded-md px-2.5 py-1">
                          <Text className="text-xs text-blue-600 font-medium">
                            {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
                          </Text>
                        </View>
                      </View>
                    ) : null
                  ) : (
                    <View className="flex-row items-center mt-2 gap-2 flex-wrap">
                      {item.number_of_seasons ? (
                        <View className="bg-purple-50 rounded-md px-2.5 py-1">
                          <Text className="text-xs text-purple-600 font-medium">
                            {item.number_of_seasons}{" "}
                            {item.number_of_seasons === 1 ? "temporada" : "temporadas"}
                          </Text>
                        </View>
                      ) : null}
                      {item.number_of_episodes ? (
                        <View className="bg-blue-50 rounded-md px-2.5 py-1">
                          <Text className="text-xs text-blue-600 font-medium">
                            {item.number_of_episodes}{" "}
                            {item.number_of_episodes === 1 ? "episodio" : "episodios"}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
              </View>

              {item.genres?.length ? (
                <View className="flex-row flex-wrap mt-4 gap-2">
                  {item.genres.map((g) => (
                    <View
                      key={g.id}
                      className="bg-indigo-100 rounded-full px-3 py-1.5"
                    >
                      <Text className="text-xs font-semibold text-indigo-700">{g.name}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {item.tagline ? (
                <Text className="text-base italic text-gray-400 mt-4 leading-5">
                  {item.tagline}
                </Text>
              ) : null}

              {item.overview ? (
                <Text className="text-base text-gray-700 leading-7 mt-4">
                  {item.overview}
                </Text>
              ) : null}

              {providers.length > 0 ? (
                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">Donde ver</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {providers.map((p) => (
                      <View key={p.provider_id} className="mr-3 items-center">
                        <Image
                          source={{ uri: tmdb.getPosterUrl(p.logo_path, "w200") }}
                          className="w-12 h-12 rounded-xl"
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
              {loadingProviders ? (
                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">Donde ver</Text>
                  <ActivityIndicator size="small" color="#3B82F6" />
                </View>
              ) : null}

              {isTV(item) && item.seasons && item.seasons.length > 0 && (
                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">
                    Temporadas
                  </Text>
                  <View className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    {item.seasons
                      .filter((s) => s.season_number > 0)
                      .map((season) => (
                        <View key={season.id}>
                          <TouchableOpacity
                            className="flex-row items-center px-4 py-3.5 active:bg-gray-100"
                            onPress={() => toggleSeason(season.season_number, item.id)}
                          >
                            {season.poster_path ? (
                              <Image
                                source={{ uri: tmdb.getPosterUrl(season.poster_path, "w200") }}
                                className="w-10 h-14 rounded-lg"
                                resizeMode="cover"
                              />
                            ) : (
                              <View className="w-10 h-14 rounded-lg bg-gray-200 items-center justify-center">
                                <Text className="text-lg">📺</Text>
                              </View>
                            )}
                            <View className="flex-1 ml-3">
                              <Text className="text-sm font-semibold text-gray-900">
                                {season.name}
                              </Text>
                              <Text className="text-xs text-gray-500 mt-0.5">
                                {season.episode_count}{" "}
                                {season.episode_count === 1 ? "episodio" : "episodios"}
                              </Text>
                            </View>
                            <View
                              className={`w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center ${expandedSeason === season.season_number ? "bg-blue-500 border-blue-500" : ""
                                }`}
                            >
                              <Text
                                className={`text-xs font-bold ${expandedSeason === season.season_number ? "text-white" : "text-gray-400"
                                  }`}
                              >
                                {expandedSeason === season.season_number ? "−" : "+"}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          {expandedSeason === season.season_number && (
                            <View className="border-t border-gray-200">
                              {loadingSeason === season.season_number ? (
                                <View className="py-6 items-center">
                                  <ActivityIndicator size="small" color="#3B82F6" />
                                </View>
                              ) : null}
                              {(() => {
                                const cacheKey = `${item.id}-${season.season_number}`;
                                const cached = seasonData[cacheKey];
                                if (!cached) return null;
                                return cached.episodes.map((ep, idx) => (
                                  <View
                                    key={ep.id}
                                    className={`flex-row items-center px-4 py-3 ${idx < cached.episodes.length - 1 ? "border-b border-gray-100" : ""
                                      } ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                  >
                                    <View className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center">
                                      <Text className="text-xs font-medium text-gray-600">
                                        {ep.episode_number}
                                      </Text>
                                    </View>
                                    <View className="flex-1 ml-3">
                                      <Text className="text-sm text-gray-800" numberOfLines={1}>
                                        {ep.name}
                                      </Text>
                                    </View>
                                    {ep.runtime ? (
                                      <View className="bg-gray-100 rounded px-2 py-0.5 ml-2">
                                        <Text className="text-xs text-gray-500">{ep.runtime}min</Text>
                                      </View>
                                    ) : null}
                                  </View>
                                ));
                              })()}
                            </View>
                          )}

                          {(() => {
                            const validSeasons = item.seasons.filter((s) => s.season_number > 0);
                            const maxSn = Math.max(...validSeasons.map((s) => s.season_number));
                            return season.season_number !== maxSn ? (
                              <View className="h-px bg-gray-200 ml-[72px]" />
                            ) : null;
                          })()}
                        </View>
                      ))}
                  </View>
                </View>
              )}

              {(() => {
                const directors = item.credits?.crew?.filter((c) => c.job === "Director") ?? [];
                const creators = isTV(item) ? item.created_by ?? [] : [];
                if (directors.length === 0 && creators.length === 0) return null;
                const people = directors.length > 0 ? directors : creators;
                const label = directors.length > 0 ? "Dirección" : "Creado por";
                return (
                  <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-3">{label}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {people.map((p) => (
                        <View key={p.id} className="mr-4 items-center" style={{ width: 72 }}>
                          {p.profile_path ? (
                            <Image
                              source={{ uri: tmdb.getPosterUrl(p.profile_path, "w200") }}
                              className="w-16 h-16 rounded-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
                              <Text className="text-xl">🎬</Text>
                            </View>
                          )}
                          <Text className="text-xs text-center text-gray-700 mt-1.5 leading-4" numberOfLines={2}>
                            {p.name}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                );
              })()}

              {item.credits?.cast && item.credits.cast.length > 0 && (
                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-900 mb-3">Reparto</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.credits.cast.slice(0, 10).map((person) => (
                      <View key={person.id} className="mr-4 items-center" style={{ width: 72 }}>
                        {person.profile_path ? (
                          <Image
                            source={{ uri: tmdb.getPosterUrl(person.profile_path, "w200") }}
                            className="w-16 h-16 rounded-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
                            <Text className="text-xl">🎭</Text>
                          </View>
                        )}
                        <Text className="text-xs text-center text-gray-700 mt-1.5 leading-4" numberOfLines={2}>
                          {person.name}
                        </Text>
                        <Text className="text-xs text-center text-gray-400 leading-4" numberOfLines={1}>
                          {person.character}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>

          <SafeAreaView className="absolute bottom-0 left-0 right-0">
            <View className="px-5 pb-5 pt-3 bg-white border-t border-gray-100">
              <TouchableOpacity
                className="bg-blue-500 rounded-xl py-4 items-center active:bg-blue-600"
                onPress={onAddToWatchlist}
              >
                <Text className="text-white font-semibold text-base">
                  Agregar a pendientes
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      ) : null}
    </Modal>
  );
}
