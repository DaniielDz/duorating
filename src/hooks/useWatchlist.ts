import { useState, useEffect, useCallback, useRef } from "react";
import { WatchlistItem } from "../types";
import * as db from "../lib/db";
import { supabase } from "../lib/supabase";

let watchlistHookCounter = 0;

export function useWatchlist(coupleId: string | null) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const channelIdRef = useRef<string | null>(null);

  const fetch = useCallback(async () => {
    if (!coupleId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await db.getWatchlist(coupleId);
      setItems(data);
    } catch {
      console.error("Error fetching watchlist");
    } finally {
      setLoading(false);
    }
  }, [coupleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (!coupleId) return;

    if (!channelIdRef.current) {
      watchlistHookCounter++;
      channelIdRef.current = `watchlist-hook-${coupleId}-${watchlistHookCounter}`;
    }

    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watchlist",
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, fetch]);

  const add = useCallback(
    async (
      tmdbId: number,
      mediaType: "movie" | "tv",
      title: string,
      posterPath: string | null,
      addedBy: string,
    ) => {
      if (!coupleId) return;
      await db.addToWatchlist(coupleId, tmdbId, mediaType, title, posterPath, addedBy);
      await fetch();
    },
    [coupleId, fetch],
  );

  const remove = useCallback(
    async (id: string) => {
      await db.removeFromWatchlist(id);
      await fetch();
    },
    [fetch],
  );

  const refresh = fetch;

  return { items, loading, add, remove, refresh };
}
