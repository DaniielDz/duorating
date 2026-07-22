import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth";
import { useWatchlist } from "../../hooks/useWatchlist";
import { RatingModal } from "../../components/ratings/RatingModal";
import { DetailModal } from "../../components/search/DetailModal";
import { useMediaDetails } from "../../hooks/useMediaDetails";
import { WatchlistItem, Rating } from "../../types";
import { tmdb } from "../../lib/tmdb";
import * as db from "../../lib/db";
import { useToast } from "../../components/ui/Toast";
import { ListSkeleton } from "../../components/ui/Skeleton";

export default function WatchlistScreen() {
  const { couple, user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { items, loading, remove, refresh } = useWatchlist(couple?.id ?? null);

  const [mediaFilter, setMediaFilter] = useState<"all" | "movie" | "tv">("all");
  const [ratingTarget, setRatingTarget] = useState<WatchlistItem | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{ id: number; mediaType: "movie" | "tv" } | null>(null);
  const { data: details, loading: detailsLoading } = useMediaDetails(
    selectedDetail?.id ?? null,
    selectedDetail?.mediaType ?? null,
  );

  const [ratingsMap, setRatingsMap] = useState<Map<string, Rating>>(new Map());
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  const isUser1 = user?.id === couple?.user_1_id;

  const loadRatingsMap = useCallback(async () => {
    if (!couple?.id) return;
    setRatingsError(null);
    try {
      const ratings = await db.getRatingsHistory(couple.id, user?.id ?? "", couple.user_1_id ?? "", couple.user_2_id ?? "");
      const map = new Map<string, Rating>();
      ratings.forEach((r) => map.set(`${r.tmdb_id}_${r.media_type}`, r));
      setRatingsMap(map);
    } catch (err) {
      const msg = err instanceof db.DBError ? err.message : "Error al cargar calificaciones";
      setRatingsError(msg);
      showToast("error", msg);
    }
  }, [couple?.id, user?.id, couple?.user_1_id, couple?.user_2_id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadRatingsMap();
    }, [refresh, loadRatingsMap]),
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedDetail(null);
  }, []);

  const handleOpenDetail = useCallback((id: number, mediaType: "movie" | "tv") => {
    setSelectedDetail({ id, mediaType });
  }, []);

  const handleRemove = useCallback(
    async (item: WatchlistItem) => {
      try {
        await remove(item.id);
        showToast("success", `"${item.title}" quitado de pendientes`);
      } catch {
        showToast("error", "No se pudo quitar de pendientes");
      }
    },
    [remove, showToast],
  );

  const handleConfirmRemove = useCallback(
    (item: WatchlistItem) => {
      Alert.alert("Quitar de pendientes", `¿Quitar "${item.title}" de la lista?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: () => handleRemove(item),
        },
      ]);
    },
    [handleRemove],
  );

  const handleMarkAsWatched = useCallback((item: WatchlistItem) => {
    setRatingTarget(item);
  }, []);

  const handleCloseRating = useCallback(() => {
    setRatingTarget(null);
  }, []);

  const handleSaveRating = useCallback(
    async (score: number, comment: string | null) => {
      if (!ratingTarget || !couple || !user) return;
      setSavingRating(true);
      try {
        await db.saveRating({
          coupleId: couple.id,
          tmdbId: ratingTarget.tmdb_id,
          mediaType: ratingTarget.media_type,
          title: ratingTarget.title,
          posterPath: ratingTarget.poster_path,
          userId: user.id,
          user1Id: couple.user_1_id,
          user2Id: couple.user_2_id!,
          score,
          comment,
        });
        loadRatingsMap();
        setRatingTarget(null);
        showToast("success", "Calificación guardada");
      } catch (err) {
        const msg = err instanceof db.DBError ? err.message : "No se pudo guardar la calificación";
        showToast("error", msg);
      } finally {
        setSavingRating(false);
      }
    },
    [ratingTarget, couple, user, showToast],
  );

  const filteredItems = (mediaFilter === "all" ? items : items.filter((i) => i.media_type === mediaFilter))
    .filter((i) => {
      const rating = ratingsMap.get(`${i.tmdb_id}_${i.media_type}`);
      if (!rating) return true;
      const myScore = isUser1 ? rating.user_1_score : rating.user_2_score;
      const partnerScore = isUser1 ? rating.user_2_score : rating.user_1_score;
      return myScore == null || partnerScore == null;
    });

  if (loading && items.length === 0) {
    return <ListSkeleton count={4} />;
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Sin pendientes
        </Text>
        <Text className="text-gray-500 text-center mb-8 leading-6">
          Agreguen contenido a su lista de pendientes para no olvidar qué ver juntos.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-xl py-4 px-8 active:bg-blue-600"
          onPress={() => router.push("/(main)/search")}
        >
          <Text className="text-white font-semibold text-base">Buscar contenido</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mediaFilters: { label: string; value: "all" | "movie" | "tv" }[] = [
    { label: "Todo", value: "all" },
    { label: "Películas", value: "movie" },
    { label: "Series", value: "tv" },
  ];

  return (
    <View className="flex-1 bg-white">
      {items.length > 0 && (
        <View className="px-4 pt-3 pb-2 border-b border-gray-100">
          <View className="flex-row gap-2">
            {mediaFilters.map((f) => (
              <TouchableOpacity
                key={f.value}
                className={`px-4 py-2 rounded-full ${mediaFilter === f.value ? "bg-blue-500" : "bg-gray-100"}`}
                onPress={() => setMediaFilter(f.value)}
              >
                <Text
                  className={`text-sm font-medium ${mediaFilter === f.value ? "text-white" : "text-gray-600"}`}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filteredItems.length === 0 && items.length > 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-400 text-lg font-medium">
            No hay {mediaFilter === "movie" ? "películas" : "series"} en pendientes
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          renderItem={({ item }) => {
            const addedByMe = item.added_by === user?.id;
            const ratingKey = `${item.tmdb_id}_${item.media_type}`;
            const rating = ratingsMap.get(ratingKey);
            const myScore = rating ? (isUser1 ? rating.user_1_score : rating.user_2_score) : null;
            const partnerScore = rating ? (isUser1 ? rating.user_2_score : rating.user_1_score) : null;
            const iRated = myScore != null;
            const partnerRated = partnerScore != null;

            let badgeType: "both" | "pending_partner" | "pending_me" | null = null;
            if (iRated && partnerRated) badgeType = "both";
            else if (iRated) badgeType = "pending_partner";
            else if (partnerRated) badgeType = "pending_me";

            return (
              <View className="flex-row bg-gray-50 rounded-xl mb-3 border border-gray-200">
                <TouchableOpacity
                  className="flex-row flex-1"
                  activeOpacity={0.7}
                  onPress={() => handleOpenDetail(item.tmdb_id, item.media_type)}
                >
                {item.poster_path ? (
                  <Image
                    source={{ uri: tmdb.getPosterUrl(item.poster_path, "w200") }}
                    className="w-20 h-28 flex-shrink-0"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-20 h-28 bg-gray-200 items-center justify-center flex-shrink-0">
                    <MaterialCommunityIcons name="filmstrip" size={28} color="#9CA3AF" />
                  </View>
                )}
                  <View className="flex-1 px-3 py-3">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <View
                        className={`px-2 py-0.5 rounded-full ${item.media_type === "movie" ? "bg-blue-500" : "bg-purple-500"}`}
                      >
                        <Text className="text-white text-xs font-medium">
                          {item.media_type === "movie" ? "Película" : "Serie"}
                        </Text>
                      </View>
                      {item.added_by && (
                        <Text className="text-xs text-gray-400">
                          {addedByMe ? "Añadido por ti" : "Añadido por tu pareja"}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="text-base font-semibold text-gray-900 mt-1.5"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {badgeType && (
                      <View
                        className={`mt-2 rounded-lg px-2.5 py-1.5 border ${
                          badgeType === "both"
                            ? "bg-blue-50 border-blue-200"
                            : badgeType === "pending_partner"
                              ? "bg-amber-50 border-amber-200"
                              : "bg-green-50 border-green-200"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            badgeType === "both"
                              ? "text-blue-700"
                              : badgeType === "pending_partner"
                                ? "text-amber-700"
                                : "text-green-700"
                          }`}
                        >
                          {badgeType === "both"
                            ? <><Ionicons name="thumbs-up" size={14} color="#1D4ED8" /> Ambos han calificado</>
                            : badgeType === "pending_partner"
                              ? <><Ionicons name="hourglass" size={14} color="#B45309" /> Esperando calificación de tu pareja</>
                              : <><Ionicons name="checkmark-circle" size={14} color="#15803D" /> Tu pareja ya calificó, falta la tuya</>}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <View className="flex-row items-end gap-2 pr-3 pb-3">
                  {!iRated && (
                    <TouchableOpacity
                      className="bg-green-500 rounded-lg py-2.5 px-3 items-center flex-row active:bg-green-600"
                      onPress={() => handleMarkAsWatched(item)}
                    >
                      <Ionicons name="eye-outline" size={16} color="#fff" />
                      <Text className="text-white text-sm font-semibold ml-1">Visto</Text>
                    </TouchableOpacity>
                  )}
                  {!iRated && !partnerRated && (
                    <TouchableOpacity
                      className="bg-red-100 rounded-lg py-2.5 px-3 items-center active:bg-red-200"
                      onPress={() => handleConfirmRemove(item)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <RatingModal
        visible={!!ratingTarget}
        onClose={handleCloseRating}
        onSave={handleSaveRating}
        title={ratingTarget?.title ?? ""}
        posterPath={ratingTarget?.poster_path ?? null}
        saving={savingRating}
      />

      <DetailModal
        item={details}
        loading={detailsLoading}
        onClose={handleCloseDetail}
        coupleId={couple?.id ?? ""}
        userId={user?.id ?? ""}
        user1Id={couple?.user_1_id ?? ""}
        user2Id={couple?.user_2_id ?? ""}
      />
    </View>
  );
}
