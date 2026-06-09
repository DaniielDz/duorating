import { useState, useEffect, useRef } from "react";
import { tmdb, TMDBMovieDetails, TMDBTVDetails } from "../lib/tmdb";

type MediaDetails = TMDBMovieDetails | TMDBTVDetails;

interface CacheEntry {
  data: MediaDetails;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 5 * 60 * 1000;

export function useMediaDetails(id: number | null, mediaType: "movie" | "tv" | null) {
  const [data, setData] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id || !mediaType) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `${mediaType}_${id}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setData(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const fetchFn =
      mediaType === "movie" ? tmdb.getMovieDetails : tmdb.getTvDetails;

    fetchFn(id, controller.signal)
      .then((result) => {
        cache.set(cacheKey, { data: result as MediaDetails, timestamp: Date.now() });
        setData(result as MediaDetails);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Error al cargar detalles");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [id, mediaType]);

  return { data, loading, error };
}
