import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../context/auth";
import { Rating, WatchlistItem } from "../../types";
import * as db from "../../lib/db";
import { tmdb } from "../../lib/tmdb";
import { supabase } from "../../lib/supabase";
import { useMediaDetails } from "../../hooks/useMediaDetails";
import { DetailModal } from "../../components/search/DetailModal";

interface Stats {
  totalRated: number;
  totalWatchlist: number;
  compatibilityPercent: number | null;
  bothRatedCount: number;
}

export default function HomeScreen() {
  const { couple, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [recentWatchlist, setRecentWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const [s, r, w] = await Promise.all([
        db.getDashboardStats(couple.id),
        db.getRecentRatings(couple.id, 2),
        db.getRecentWatchlist(couple.id, 2),
      ]);
      setStats(s);
      setRecentRatings(r);
      setRecentWatchlist(w);
    } catch {
      // ignore
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

    const channel = supabase
      .channel(`dashboard-${couple.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ratings",
          filter: `couple_id=eq.${couple.id}`,
        },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watchlist",
          filter: `couple_id=eq.${couple.id}`,
        },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple, fetchData]);

  const getCompatibilityLabel = (pct: number) => {
    if (pct >= 90) return "¡Almas gemelas del cine! 💖🍿";
    if (pct >= 80) return "¡Excelente sintonía! 🎬✨";
    if (pct >= 70) return "¡Gustos parecidos! 👍🍿";
    return "¡Debates divertidos asegurados! 🗯️📽️";
  };

  if (loading) {
    return (
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </ScrollView>
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
          ¡Hola{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
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
            Compatibilidad 🎯
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
            Compatibilidad 🎯
          </Text>
          <Text className="text-gray-400 text-base leading-6">
            Califica contenido con tu pareja para ver su compatibilidad cinéfila.
          </Text>
        </View>
      )}

      {recentWatchlist.length > 0 && (
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Próximos por ver 📋
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
                  <Text className="text-xl">🎬</Text>
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
            Últimas calificaciones ⭐
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
                  <Text className="text-xl">🎬</Text>
                </View>
              )}
                <View className="flex-1 px-3">
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {avgScore ? (
                    <Text className="text-yellow-600 font-bold text-sm mt-0.5">
                      ★ {avgScore}
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
