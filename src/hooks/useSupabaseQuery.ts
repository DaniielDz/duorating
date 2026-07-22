import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";

interface UseSupabaseQueryOptions<T> {
  fetchFn: () => Promise<T>;
  onError?: (error: Error) => void;
  errorMessage?: string;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSupabaseQuery<T>(
  options: UseSupabaseQueryOptions<T>,
  deps: unknown[] = [],
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const { showToast } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await options.fetchFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const msg =
        err instanceof Error
          ? isNetworkError(err)
            ? "Error de conexión. Verifica tu internet e intenta de nuevo."
            : err.message
          : options.errorMessage || "Ocurrió un error inesperado";
      setError(msg);
      showToast("error", msg);
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function isNetworkError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch") ||
    msg.includes("unexpected end of json") ||
    msg.includes("could not connect") ||
    msg.includes("timeout") ||
    msg.includes("abort")
  );
}

let channelCounter = 0;

export function subscribeToChanges(
  table: string,
  coupleId: string,
  callback: () => void,
) {
  channelCounter++;
  const uniqueId = `${table}-${coupleId}-${channelCounter}-${Date.now()}`;
  const channel = supabase
    .channel(uniqueId)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter: `couple_id=eq.${coupleId}`,
      },
      () => callback(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
