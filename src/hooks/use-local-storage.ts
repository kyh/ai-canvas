"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

/**
 * SSR-safe localStorage-backed string state, synced across tabs (native
 * `storage` events) and within the same tab (a custom `local-storage`
 * event dispatched on every write). String-only on purpose: the app's only
 * persisted key ("gateway-api-key") is a string, and dropping JSON support
 * removes the need for unchecked casts.
 */

const SAME_TAB_EVENT = "local-storage";

const detailSchema = z.object({
  key: z.string(),
  newValue: z.string().nullable(),
});

const readValue = (key: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
};

export function useLocalStorage(
  key: string,
  initialValue: string,
): [string, (value: string) => void, () => void] {
  const [storedValue, setStoredValue] = useState(() => readValue(key, initialValue));

  const setValue = useCallback(
    (value: string) => {
      setStoredValue(value);
      try {
        window.localStorage.setItem(key, value);
        window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT, { detail: { key, newValue: value } }));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT, { detail: { key, newValue: null } }));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleChange = (event: Event) => {
      if (event instanceof StorageEvent) {
        if (event.key !== key) return;
        setStoredValue(event.newValue ?? initialValue);
        return;
      }
      if (event instanceof CustomEvent) {
        const detail = detailSchema.safeParse(event.detail);
        if (!detail.success || detail.data.key !== key) return;
        setStoredValue(detail.data.newValue ?? initialValue);
      }
    };
    window.addEventListener("storage", handleChange);
    window.addEventListener(SAME_TAB_EVENT, handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(SAME_TAB_EVENT, handleChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
