// Advanced component optimization with React patterns
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle, PerformanceMonitor } from '../lib/performance';

// Optimized hook for data fetching with caching and error handling
export function useOptimizedData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options: {
    cacheKey?: string;
    cacheTime?: number;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await PerformanceMonitor.measure(
        `fetch_${options.cacheKey || 'data'}`,
        fetcher
      );
      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetcher, options.cacheKey]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

// Optimized search hook with debouncing
export function useOptimizedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: {
    debounceMs?: number;
    minQueryLength?: number;
  } = {}
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);
  const { debounceMs = 300, minQueryLength = 2 } = options;

  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        return;
      }

      setSearching(true);
      try {
        const searchResults = await PerformanceMonitor.measure(
          `search_${searchQuery}`,
          () => searchFunction(searchQuery)
        );
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, debounceMs),
    [searchFunction, debounceMs, minQueryLength]
  );

  useEffect(() => {
    debouncedSearch(query);
    // Clean up is handled automatically by debounce
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    searching,
    clearResults: () => setResults([])
  };
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);

  const visibleItems = useMemo(
    () => items.slice(visibleRange.startIndex, visibleRange.endIndex + 1),
    [items, visibleRange]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop: useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []),
  };
}

// Optimized form handling
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>,
  options: {
    debounceMs?: number;
    validateOnChange?: boolean;
  } = {}
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const { debounceMs = 300, validateOnChange = false } = options;

  const debouncedValidate = useMemo(
    () => debounce((vals: T) => {
      if (validate) {
        const validationErrors = validate(vals);
        setErrors(validationErrors);
      }
    }, debounceMs),
    [validate, debounceMs]
  );

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validateOnChange) {
      debouncedValidate({ ...values, [name]: value });
    }
  }, [values, validateOnChange, debouncedValidate]);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validateForm = useCallback(() => {
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [validate, values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    clearError,
    resetForm,
    validateForm,
    isValid: Object.keys(errors).length === 0,
  };
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      options
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}