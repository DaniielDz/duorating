import { User, Session } from "@supabase/supabase-js";

export type { User, Session };

export interface Couple {
  id: string;
  user_1_id: string;
  user_2_id: string | null;
  invite_code: string;
  created_at: string;
}

export interface Rating {
  id: string;
  couple_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string;
  user_1_score: number | null;
  user_2_score: number | null;
  user_1_comment: string | null;
  user_2_comment: string | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  couple_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string;
  added_by: string;
  created_at: string;
}

export type MediaType = "movie" | "tv";
