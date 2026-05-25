"use client";

import { useState, useCallback, useEffect } from "react";

export type Template = "cyberpunk" | "hardtek" | "jungle" | "minimal";

export interface SeoData {
  title: string;
  description: string;
  keywords: string;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  template: Template;
  /** Multi-page map: page key → full HTML string */
  pages: Record<string, string>;
  seo: SeoData;
  timestamp: number;
}

const STORAGE_KEY = "ravebuilder_history";
const MAX_ENTRIES = 5;

/** Get the "primary" HTML for an entry (home page, or fallback) */
export function getPrimaryHtml(entry: HistoryEntry): string {
  return entry.pages?.home ?? Object.values(entry.pages ?? {})[0] ?? "";
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryEntry[];
        // Migrate old single-html entries
        const migrated = parsed.map((e) => {
          if (!e.pages) {
            const legacyHtml = (e as unknown as Record<string, string>).html ?? "";
            return { ...e, pages: { home: legacyHtml } };
          }
          return e;
        });
        setHistory(migrated);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((entries: HistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // storage quota exceeded
    }
  }, []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        persist(updated);
        return updated;
      });
      return newEntry;
    },
    [persist]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const duplicateEntry = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const source = prev.find((e) => e.id === id);
        if (!source) return prev;
        const dupe: HistoryEntry = {
          ...source,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        const updated = [dupe, ...prev].slice(0, MAX_ENTRIES);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  return { history, hydrated, addEntry, deleteEntry, duplicateEntry };
}
