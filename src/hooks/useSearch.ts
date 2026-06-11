import { useState, useEffect, useRef, useCallback } from "react";
import { tmdb, TMDBResult } from "../lib/tmdb";

interface CacheEntry {
  results: TMDBResult[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000;

export function useSearch(query: string, mediaType: "all" | "movie" | "tv" = "all") {
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      const cacheKey = `${q}|${mediaType}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < TTL) {
        setResults(cached.results);
        setLoading(false);
        setError(null);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const data = await tmdb.search(q, mediaType, controller.signal);
        cache.set(cacheKey, { results: data, timestamp: Date.now() });
        setResults(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Error de búsqueda");
      } finally {
        setLoading(false);
      }
    },
    [mediaType],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { results, loading, error };
}
