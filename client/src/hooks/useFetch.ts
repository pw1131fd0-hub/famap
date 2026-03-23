import { useState, useCallback, useEffect, useRef } from 'react';

interface FetchState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  retry: () => void;
}

interface FetchOptions {
  immediate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: <T>(data: T) => void;
}

/**
 * Custom hook for data fetching with error handling and retry logic
 * Replaces direct API calls with better state management
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options: FetchOptions = {}
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        retryCountRef.current = 0;
        options.onSuccess?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setData(null);
        options.onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, options]);

  const retry = useCallback(() => {
    retryCountRef.current++;
    execute();
  }, [execute]);

  useEffect(() => {
    isMountedRef.current = true;
    if (options.immediate !== false) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, deps);

  return { data, error, loading, retry };
}

/**
 * Hook for managing paginated data fetching
 */
export function usePaginatedFetch<T>(
  fetcher: (page: number) => Promise<T[]>,
  deps: any[] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newItems = await fetcher(page);
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      setHasMore(newItems.length > 0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetcher, page]);

  return { items, loading, error, hasMore, loadMore, reset: () => setItems([]) };
}
