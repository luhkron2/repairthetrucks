import { useEffect, useRef, useCallback } from 'react';

interface UseFormAutosaveOptions<T> {
  key: string;
  data: T;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useFormAutosave<T extends Record<string, unknown>>({
  key,
  data,
  interval = 30000, // 30 seconds default
  enabled = true,
}: UseFormAutosaveOptions<T>) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  const save = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    const dataString = JSON.stringify(data);
    
    // Only save if data has changed
    if (dataString === lastSavedRef.current) return;
    
    try {
      const draft = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`draft:${key}`, JSON.stringify(draft));
      lastSavedRef.current = dataString;
      console.log(`[Autosave] Draft saved for ${key}`);
    } catch (error) {
      console.error('[Autosave] Failed to save draft:', error);
    }
  }, [data, enabled, key]);

  const load = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(`draft:${key}`);
      if (!saved) return null;

      const draft = JSON.parse(saved);
      return draft.data;
    } catch (error) {
      console.error('[Autosave] Failed to load draft:', error);
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`draft:${key}`);
      lastSavedRef.current = '';
      console.log(`[Autosave] Draft cleared for ${key}`);
    } catch (error) {
      console.error('[Autosave] Failed to clear draft:', error);
    }
  }, [key]);

  const getTimestamp = useCallback((): number | null => {
    if (typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(`draft:${key}`);
      if (!saved) return null;

      const draft = JSON.parse(saved);
      return draft.timestamp;
    } catch {
      return null;
    }
  }, [key]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(save, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [save, interval, enabled]);

  // Save before unload
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      save();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [save, enabled]);

  return {
    save,
    load,
    clear,
    getTimestamp,
  };
}
