import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth";
import { Rating, WatchlistItem } from "../../types";
import * as db from "../../lib/db";
import { tmdb } from "../../lib/tmdb";
import { supabase } from "../../lib/supabase";
import { useMediaDetails } from "../../hooks/useMediaDetails";
import { DetailModal } from "../../components/search/DetailModal";
import { DashboardSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { subscribeToChanges } from "../../hooks/useSupabaseQuery";

interface Stats {
  totalRated: number;
  totalWatchlist: number;
  compatibilityPercent: number | null;
  bothRatedCount: number;
}

export default function HomeScreen() {
  const { couple, user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [recentWatchlist, setRecentWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{ id: number; mediaType: "movie" | "tv" } | null>(null);
  const { data: details, loading: detailsLoading } = useMediaDetails(
    selectedDetail?.id ?? null,
    selectedDetail?.mediaType ?? null,
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedDetail(null);
  }, []);

  const handleOpenDetail = useCallback((id: number, mediaType: "movie" | "tv") => {
    setSelectedDetail({ id, mediaType });
  }, []);

  const fetchData = useCallback(async () => {
    if (!couple) return;
    setError(null);
    try {
      const [s, r, w] = await Promise.all([
        db.getDashboardStats(couple.id),
        db.getRecentRatings(couple.id, 2),
        db.getRecentWatchlist(couple.id, 2),
      ]);
      setStats(s);
      setRecentRatings(r);
      setRecentWatchlist(w);
    } catch (err) {
      const msg = err instanceof db.DBError ? err.message : "Error al cargar el dashboard";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [couple]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  useEffect(() => {
    if (!couple) return;

    const unsub1 = subscribeToChanges("ratings", couple.id, fetchData);
    const unsub2 = subscribeToChanges("watchlist", couple.id, fetchData);

    return () => {
      unsub1();
      unsub2();
    };
  }, [couple, fetchData]);

  const getCompatibilityLabel = (pct: number) => {
    if (pct >= 90) return <>¡Almas gemelas del cine! <Ionicons name="heart" size={14} color="#EAB308" /> <MaterialCommunityIcons name="popcorn" size={14} color="#EAB308" /></>;
    if (pct >= 80) return <>¡Excelente sintonía! <MaterialCommunityIcons name="filmstrip" size={14} color="#EAB308" /> <Ionicons name="sparkles" size={14} color="#EAB308" /></>;
    if (pct >= 70) return <>¡Gustos parecidos! <Ionicons name="thumbs-up" size={14} color="#EAB308" /> <MaterialCommunityIcons name="popcorn" size={14} color="#EAB308" /></>;
    return <>¡Debates divertidos asegurados! <Ionicons name="chatbubble-ellipses" size={14} color="#EAB308" /> <MaterialCommunityIcons name="filmstrip-box" size={14} color="#EAB308" /></>;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error && !stats) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Ionicons name="alert-circle" size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text className="text-xl font-bold text-gray-900 mb-2">Error al cargar</Text>
        <Text className="text-gray-500 text-center mb-8 leading-6">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-xl py-4 px-10 active:bg-blue-600"
          onPress={fetchData}
        >
          <Text className="text-white font-semibold text-base">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
    >
      <View className="px-5 pt-8 pb-6">
        <Text className="text-3xl font-bold text-gray-900">
          ¡Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}! <Ionicons name="hand-left-outline" size={28} color="#374151" />
        </Text>
        <Text className="text-gray-500 mt-1">
          Esto es lo que han visto juntos
        </Text>
      </View>

      <View className="px-5 flex-row gap-3 mb-6">
        <View className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <Text className="text-3xl font-bold text-blue-600">{stats?.totalRated ?? 0}</Text>
          <Text className="text-sm text-blue-500 mt-1 font-medium">Vistas</Text>
          <Text className="text-xs text-blue-400 mt-0.5">películas/series</Text>
        </View>
        <View className="flex-1 bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <Text className="text-3xl font-bold text-purple-600">{stats?.totalWatchlist ?? 0}</Text>
          <Text className="text-sm text-purple-500 mt-1 font-medium">Pendientes</Text>
          <Text className="text-xs text-purple-400 mt-0.5">por ver</Text>
        </View>
      </View>

      {stats?.compatibilityPercent != null && (
        <View className="mx-5 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
          <Text className="text-sm text-yellow-700 font-semibold mb-1">
            Compatibilidad <Ionicons name="locate-outline" size={16} color="#A16207" />
          </Text>
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-5xl font-bold text-yellow-600">
              {stats.compatibilityPercent}%
            </Text>
          </View>
          <Text className="text-yellow-700 mt-2 text-sm leading-5">
            {getCompatibilityLabel(stats.compatibilityPercent)}
          </Text>
          <Text className="text-yellow-500 text-xs mt-1">
            Basado en {stats.bothRatedCount} calificación{stats.bothRatedCount !== 1 ? "es" : ""} en común
          </Text>
        </View>
      )}

      {stats?.compatibilityPercent == null && stats && (
        <View className="mx-5 mb-6 bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <Text className="text-sm text-gray-500 font-semibold mb-1">
            Compatibilidad <Ionicons name="locate-outline" size={16} color="#6B7280" />
          </Text>
          <Text className="text-gray-400 text-base leading-6">
            Califica contenido con tu pareja para ver su compatibilidad cinéfila.
          </Text>
        </View>
      )}

      {recentWatchlist.length > 0 && (
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Próximos por ver <Ionicons name="clipboard-outline" size={18} color="#111827" />
          </Text>
          {recentWatchlist.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center bg-gray-50 rounded-xl mb-2 overflow-hidden border border-gray-200 active:opacity-80"
              onPress={() => handleOpenDetail(item.tmdb_id, item.media_type)}
            >
              {item.poster_path ? (
                <Image
                  source={{ uri: tmdb.getPosterUrl(item.poster_path, "w200") }}
                  className="w-14 h-20"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-20 bg-gray-200 items-center justify-center">
                  <MaterialCommunityIcons name="filmstrip" size={24} color="#9CA3AF" />
                </View>
              )}
              <View className="flex-1 px-3">
                <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {item.media_type === "movie" ? "Película" : "Serie"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {recentRatings.length > 0 && (
        <View className="px-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Últimas calificaciones <Ionicons name="star" size={18} color="#111827" />
          </Text>
          {recentRatings.map((item) => {
            const avgScore =
              item.user_1_score != null && item.user_2_score != null
                ? ((item.user_1_score + item.user_2_score) / 2).toFixed(1)
                : null;

            return (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center bg-gray-50 rounded-xl mb-2 overflow-hidden border border-gray-200 active:opacity-80"
                onPress={() => handleOpenDetail(item.tmdb_id, item.media_type)}
              >
              {item.poster_path ? (
                <Image
                  source={{ uri: tmdb.getPosterUrl(item.poster_path, "w200") }}
                  className="w-14 h-20"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-20 bg-gray-200 items-center justify-center">
                  <MaterialCommunityIcons name="filmstrip" size={24} color="#9CA3AF" />
                </View>
              )}
                <View className="flex-1 px-3">
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {avgScore ? (
                      <Text className="text-yellow-600 font-bold text-sm mt-0.5">
                        <Ionicons name="star" size={14} color="#EAB308" /> {avgScore}
                      </Text>
                  ) : (
                    <Text className="text-xs text-gray-400 mt-0.5">Calificación pendiente</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>

      <DetailModal
        item={details}
        loading={detailsLoading}
        onClose={handleCloseDetail}
        coupleId={couple?.id ?? ""}
        userId={user?.id ?? ""}
        user1Id={couple?.user_1_id ?? ""}
        user2Id={couple?.user_2_id ?? ""}
      />
    </>
  );
}
