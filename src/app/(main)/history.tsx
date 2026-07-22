import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth";
import { Rating } from "../../types";
import * as db from "../../lib/db";
import { tmdb } from "../../lib/tmdb";
import { supabase } from "../../lib/supabase";
import { useMediaDetails } from "../../hooks/useMediaDetails";
import { DetailModal } from "../../components/search/DetailModal";
import { useToast } from "../../components/ui/Toast";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { subscribeToChanges } from "../../hooks/useSupabaseQuery";

type MediaFilter = "all" | "movie" | "tv";
type StatusFilter = "all" | "both" | "pending_me" | "pending_partner";
type SortOption = "newest" | "oldest" | "highest_avg";

export default function HistoryScreen() {
  const { couple, user } = useAuth();
  const { showToast } = useToast();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedDetail, setSelectedDetail] = useState<{ id: number; mediaType: "movie" | "tv" } | null>(null);
  const { data: details, loading: detailsLoading } = useMediaDetails(
    selectedDetail?.id ?? null,
    selectedDetail?.mediaType ?? null,
  );

  const isUser1 = user?.id === couple?.user_1_id;

  const loadRatings = useCallback(async (isInitial = false) => {
    if (!couple || !user) return;
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await db.getRatingsHistory(couple.id, user.id, couple.user_1_id!, couple.user_2_id!, {
        mediaType: mediaFilter,
        ratingStatus: statusFilter,
        sortBy,
      });
      setRatings(data);
    } catch (err) {
      const msg = err instanceof db.DBError ? err.message : "Error al cargar historial";
      setError(msg);
      if (!isInitial) showToast("error", msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [couple, user, mediaFilter, statusFilter, sortBy]);

  useEffect(() => {
    loadRatings(true);
  }, [loadRatings]);

  useEffect(() => {
    if (!couple) return;
    const unsub = subscribeToChanges("ratings", couple.id, () => loadRatings());
    return unsub;
  }, [couple, loadRatings]);

  useFocusEffect(
    useCallback(() => {
      loadRatings();
    }, [loadRatings]),
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedDetail(null);
    loadRatings();
  }, [loadRatings]);

  const handleOpenDetail = useCallback((id: number, mediaType: "movie" | "tv") => {
    setSelectedDetail({ id, mediaType });
  }, []);

  const handleDeleteRating = useCallback(
    async (item: Rating) => {
      Alert.alert(
        "Eliminar calificación",
        "¿Seguro que quieres eliminar esta calificación?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await db.deleteRating(item.id);
                loadRatings();
                showToast("success", "Calificación eliminada");
              } catch (err) {
                const msg = err instanceof db.DBError ? err.message : "No se pudo eliminar";
                showToast("error", msg);
              }
            },
          },
        ],
      );
    },
    [loadRatings, showToast],
  );

  const mediaFilters: { label: string; value: MediaFilter }[] = [
    { label: "Todo", value: "all" },
    { label: "Películas", value: "movie" },
    { label: "Series", value: "tv" },
  ];

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "Todas", value: "all" },
    { label: "Ambos", value: "both" },
    { label: "Solo yo", value: "pending_me" },
    { label: "Solo pareja", value: "pending_partner" },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-3 pb-2 border-b border-gray-100">
        <View className="flex-row gap-2 mb-2">
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
        <View className="flex-row gap-2">
          {statusFilters.map((f) => (
            <TouchableOpacity
              key={f.value}
              className={`px-3 py-1.5 rounded-full ${statusFilter === f.value ? "bg-indigo-500" : "bg-gray-100"}`}
              onPress={() => setStatusFilter(f.value)}
            >
              <Text
                className={`text-xs font-medium ${statusFilter === f.value ? "text-white" : "text-gray-600"}`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row gap-2 mt-2">
          {(["newest", "oldest", "highest_avg"] as SortOption[]).map((s) => (
            <TouchableOpacity
              key={s}
              className={`px-3 py-1.5 rounded-full ${sortBy === s ? "bg-emerald-500" : "bg-gray-100"}`}
              onPress={() => setSortBy(s)}
            >
              <Text
                className={`text-xs font-medium ${sortBy === s ? "text-white" : "text-gray-600"}`}
              >
                {s === "newest" ? "Más reciente" : s === "oldest" ? "Más antigua" : "Mejor nota"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ListSkeleton count={4} />
      ) : error && ratings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle" size={48} color="#EF4444" style={{ marginBottom: 16 }} />
          <Text className="text-xl font-bold text-gray-900 mb-2">Error al cargar</Text>
          <Text className="text-gray-500 text-center mb-8 leading-6">{error}</Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 px-10 active:bg-blue-600"
            onPress={() => loadRatings(true)}
          >
            <Text className="text-white font-semibold text-base">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : ratings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="bar-chart" size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Sin historial
          </Text>
          <Text className="text-gray-500 text-center leading-6">
            Las películas y series que califiquen aparecerán aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadRatings()} />
          }
          renderItem={({ item }) => {
            const myScore = isUser1 ? item.user_1_score : item.user_2_score;
            const partnerScore = isUser1 ? item.user_2_score : item.user_1_score;
            const myComment = isUser1 ? item.user_1_comment : item.user_2_comment;
            const partnerComment = isUser1 ? item.user_2_comment : item.user_1_comment;
            const avgScore =
              item.user_1_score != null && item.user_2_score != null
                ? ((item.user_1_score + item.user_2_score) / 2).toFixed(1)
                : null;

            return (
              <TouchableOpacity
                className="flex-row bg-gray-50 rounded-xl mb-3 overflow-hidden border border-gray-200 active:opacity-80"
                onPress={() => handleOpenDetail(item.tmdb_id, item.media_type)}
              >
                <View className="w-20">
                  {item.poster_path ? (
                    <Image
                      source={{ uri: tmdb.getPosterUrl(item.poster_path, "w200") }}
                      style={[StyleSheet.absoluteFill, { width: undefined, height: undefined }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center bg-gray-200">
                      <MaterialCommunityIcons name="filmstrip" size={28} color="#9CA3AF" />
                    </View>
                  )}
                </View>
                <View className="flex-1 px-3 py-3 justify-between">
                  <View>
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`px-2 py-0.5 rounded-full ${item.media_type === "movie" ? "bg-blue-500" : "bg-purple-500"
                          }`}
                      >
                        <Text className="text-white text-xs font-medium">
                          {item.media_type === "movie" ? "Película" : "Serie"}
                        </Text>
                      </View>
                      {avgScore && (
                        <Text className="text-yellow-600 font-bold text-sm">
                          <Ionicons name="star" size={14} color="#EAB308" /> {avgScore}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="text-base font-semibold text-gray-900 mt-1.5"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View className="flex-row gap-3 mt-1">
                    <View className="flex-1">
                      {myScore != null ? (
                        <Text className="text-sm text-gray-700">
                          <Text className="font-semibold">Tú:</Text> {myScore}/10
                          {myComment && (
                            <Text className="text-gray-500 italic">
                              {" "}"{myComment}"
                            </Text>
                          )}
                        </Text>
                      ) : (
                        <Text className="text-sm text-amber-500 font-medium">
                          Pendiente por ti
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      {partnerScore != null ? (
                        <Text className="text-sm text-gray-700">
                          <Text className="font-semibold">Pareja:</Text> {partnerScore}/10
                          {partnerComment && (
                            <Text className="text-gray-500 italic">
                              {" "}"{partnerComment}"
                            </Text>
                          )}
                        </Text>
                      ) : (
                        <Text className="text-sm text-amber-500 font-medium">
                          Pendiente por tu pareja
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row justify-end gap-3 mt-2">
                    <TouchableOpacity
                      onPress={() => handleOpenDetail(item.tmdb_id, item.media_type)}
                    >
                      <Ionicons name="pencil-outline" size={22} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteRating(item)}
                    >
                      <Ionicons name="trash-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

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
