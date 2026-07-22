import { supabase } from "./supabase";
import { Rating, WatchlistItem } from "../types";

export class DBError extends Error {
  constructor(message: string, public original?: unknown) {
    super(message);
    this.name = "DBError";
  }
}

export function isNetworkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    msg.includes("network") ||
    msg.includes("fetch failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("unexpected end of json") ||
    msg.includes("could not connect") ||
    msg.includes("timeout") ||
    msg.includes("abort")
  );
}

function wrapError(err: unknown): never {
  if (isNetworkError(err)) {
    throw new DBError("Error de conexión. Verifica tu internet e intenta de nuevo.", err);
  }
  if (err instanceof DBError) throw err;
  const message = err instanceof Error ? err.message : "Error inesperado en la base de datos";
  throw new DBError(message, err);
}

export async function getWatchlist(coupleId: string): Promise<WatchlistItem[]> {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    wrapError(err);
  }
}

export async function addToWatchlist(
  coupleId: string,
  tmdbId: number,
  mediaType: "movie" | "tv",
  title: string,
  posterPath: string | null,
  addedBy: string,
): Promise<void> {
  try {
    const { error } = await supabase.from("watchlist").insert({
      couple_id: coupleId,
      tmdb_id: tmdbId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      added_by: addedBy,
    });
    if (error) throw error;
  } catch (err) {
    wrapError(err);
  }
}

export async function removeFromWatchlist(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    wrapError(err);
  }
}

export async function getWatchlistItem(
  coupleId: string,
  tmdbId: number,
  mediaType: string,
): Promise<WatchlistItem | null> {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    wrapError(err);
  }
}

export async function getRating(
  coupleId: string,
  tmdbId: number,
  mediaType: string,
): Promise<Rating | null> {
  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    wrapError(err);
  }
}

export async function saveRating(params: {
  coupleId: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  userId: string;
  user1Id: string;
  user2Id: string;
  score: number;
  comment: string | null;
}): Promise<void> {
  try {
    const { coupleId, tmdbId, mediaType, title, posterPath, userId, user1Id, user2Id, score, comment } = params;

    const existing = await getRating(coupleId, tmdbId, mediaType);
    const isUser1 = userId === user1Id;
    const scoreField = isUser1 ? "user_1_score" : "user_2_score";
    const commentField = isUser1 ? "user_1_comment" : "user_2_comment";

    if (existing) {
      const { error } = await supabase
        .from("ratings")
        .update({
          [scoreField]: score,
          [commentField]: comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;

      const otherScoreField = isUser1 ? "user_2_score" : "user_1_score";
      if (existing[otherScoreField] != null) {
        await supabase
          .from("watchlist")
          .delete()
          .eq("couple_id", coupleId)
          .eq("tmdb_id", tmdbId)
          .eq("media_type", mediaType);
      }
    } else {
      const insertData: Record<string, unknown> = {
        couple_id: coupleId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        [scoreField]: score,
        [commentField]: comment,
      };
      if (isUser1) {
        insertData.user_2_score = null;
        insertData.user_2_comment = null;
      } else {
        insertData.user_1_score = null;
        insertData.user_1_comment = null;
      }
      const { error } = await supabase.from("ratings").insert(insertData);
      if (error) throw error;
    }
  } catch (err) {
    wrapError(err);
  }
}

export async function deleteRating(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("ratings").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    wrapError(err);
  }
}

export async function getRatingsHistory(
  coupleId: string,
  userId: string,
  user1Id: string,
  user2Id: string,
  options?: {
    mediaType?: "movie" | "tv" | "all";
    ratingStatus?: "both" | "pending_me" | "pending_partner" | "all";
    sortBy?: "newest" | "oldest" | "highest_avg";
  },
): Promise<Rating[]> {
  try {
    let query = supabase
      .from("ratings")
      .select("*")
      .eq("couple_id", coupleId);

    if (options?.mediaType && options.mediaType !== "all") {
      query = query.eq("media_type", options.mediaType);
    }

    const { data, error } = await query.order("updated_at", { ascending: false, nullsFirst: false });
    if (error) throw error;

  let ratings = data ?? [];

  const isUser1 = userId === user1Id;
  const myScoreField = isUser1 ? "user_1_score" : "user_2_score";
  const partnerScoreField = isUser1 ? "user_2_score" : "user_1_score";

  if (options?.ratingStatus === "both") {
    ratings = ratings.filter((r) => r.user_1_score != null && r.user_2_score != null);
  } else if (options?.ratingStatus === "pending_me") {
    ratings = ratings.filter((r) => r[myScoreField] != null && r[partnerScoreField] == null);
  } else if (options?.ratingStatus === "pending_partner") {
    ratings = ratings.filter((r) => r[myScoreField] == null && r[partnerScoreField] != null);
  }

  const getUpdatedAt = (r: Rating) => r.updated_at || r.created_at;

  if (options?.sortBy === "newest") {
    ratings.sort((a, b) => new Date(getUpdatedAt(b)).getTime() - new Date(getUpdatedAt(a)).getTime());
  } else if (options?.sortBy === "oldest") {
    ratings.sort((a, b) => new Date(getUpdatedAt(a)).getTime() - new Date(getUpdatedAt(b)).getTime());
  } else if (options?.sortBy === "highest_avg") {
    ratings.sort((a, b) => {
      const avgA = ((a.user_1_score ?? 0) + (a.user_2_score ?? 0)) / 2;
      const avgB = ((b.user_1_score ?? 0) + (b.user_2_score ?? 0)) / 2;
      return avgB - avgA;
    });
  }

  return ratings;
  } catch (err) {
    wrapError(err);
  }
}
export async function getDashboardStats(coupleId: string) {
  try {
    const { data: ratings, error: ratingsError } = await supabase
      .from("ratings")
      .select("*")
      .eq("couple_id", coupleId);
    if (ratingsError) throw ratingsError;

    const { data: watchlist, error: watchlistError } = await supabase
      .from("watchlist")
      .select("*")
      .eq("couple_id", coupleId);
    if (watchlistError) throw watchlistError;

  const totalRated = ratings?.length ?? 0;
  const totalWatchlist = watchlist?.length ?? 0;

  let compatibility = 0;
  let compatibilityCount = 0;
  (ratings ?? [])
    .filter((r) => r.user_1_score != null && r.user_2_score != null)
    .forEach((r) => {
      compatibility += Math.abs((r.user_1_score ?? 0) - (r.user_2_score ?? 0));
      compatibilityCount++;
    });

  const avgDiff = compatibilityCount > 0 ? compatibility / compatibilityCount : 0;
  const compatibilityPercent = Math.round((1 - avgDiff / 10) * 100);

  return {
    totalRated,
    totalWatchlist,
    compatibilityPercent: compatibilityCount > 0 ? Math.max(0, compatibilityPercent) : null,
    bothRatedCount: compatibilityCount,
  };
  } catch (err) {
    wrapError(err);
  }
}

export async function getRecentRatings(
  coupleId: string,
  limit = 3,
): Promise<Rating[]> {
  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    wrapError(err);
  }
}

export async function getRecentWatchlist(
  coupleId: string,
  limit = 3,
): Promise<WatchlistItem[]> {
  try {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    wrapError(err);
  }
}
