"use client";

import { useState, useCallback, useEffect } from "react";

export interface DeployEntry {
  id:             string;
  timestamp:      number;
  url:            string;
  customDomain?:  string;
  projectName:    string;
  pageCount:      number;
  prompt:         string;
  template:       string;
  /** ID of the matching generation history entry, used to redeploy pages */
  generationId?:  string;
}

const STORAGE_KEY = "ravebuilder_deploy_history";
const MAX_ENTRIES = 20;

export function useDeployHistory() {
  const [deployHistory, setDeployHistory] = useState<DeployEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDeployHistory(JSON.parse(raw) as DeployEntry[]);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((entries: DeployEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // storage quota exceeded
    }
  }, []);

  const addDeployEntry = useCallback(
    (entry: Omit<DeployEntry, "id" | "timestamp">): DeployEntry => {
      const newEntry: DeployEntry = {
        ...entry,
        id:        crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setDeployHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        persist(updated);
        return updated;
      });
      return newEntry;
    },
    [persist]
  );

  const deleteDeployEntry = useCallback(
    (id: string) => {
      setDeployHistory((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const clearDeployHistory = useCallback(() => {
    setDeployHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { deployHistory, hydrated, addDeployEntry, deleteDeployEntry, clearDeployHistory };
}
