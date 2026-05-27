import { useCallback, useEffect, useState } from "react";

type Updater<T> = T | ((current: T) => T);

function readSafe<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return validate ? (validate(parsed) ? parsed : fallback) : (parsed as T);
  } catch {
    return fallback;
  }
}

export function useLocalStorageSafe<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T
) {
  const [value, setValueState] = useState<T>(() => readSafe(key, fallback, validate));

  useEffect(() => {
    setValueState(readSafe(key, fallback, validate));
  }, [fallback, key, validate]);

  const setValue = useCallback(
    (next: Updater<T>) => {
      setValueState((current) => {
        const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage can be unavailable or full; keep the UI state alive in memory.
        }
        return resolved;
      });
    },
    [key]
  );

  const resetValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore blocked storage.
    }
    setValueState(fallback);
  }, [fallback, key]);

  return [value, setValue, resetValue] as const;
}
