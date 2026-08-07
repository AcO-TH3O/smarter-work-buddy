import { useCallback, useEffect, useState } from "react";

export type HistoryKind = "email" | "meeting" | "task";

export type HistoryEntry = {
  id: string;
  kind: HistoryKind;
  title: string;
  preview: string;
  createdAt: string;
};

export type Settings = {
  defaultTone: "Formal" | "Friendly" | "Persuasive";
  plannerMode: "Daily" | "Weekly";
  darkMode: boolean;
};

const HISTORY_KEY = "awpa.history";
const SETTINGS_KEY = "awpa.settings";

export const defaultSettings: Settings = {
  defaultTone: "Formal",
  plannerMode: "Daily",
  darkMode: false,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    setSettings(read<Settings>(SETTINGS_KEY, defaultSettings));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("awpa:settings"));
      return next;
    });
  }, []);

  return { settings, update };
}

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "createdAt">) {
  const list = readHistory();
  list.unshift({
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 100)));
  window.dispatchEvent(new Event("awpa:history"));
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const sync = () => setHistory(readHistory());
    sync();
    window.addEventListener("awpa:history", sync);
    return () => window.removeEventListener("awpa:history", sync);
  }, []);

  const remove = useCallback((id: string) => {
    const next = readHistory().filter((e) => e.id !== id);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("awpa:history"));
  }, []);

  const clear = useCallback(() => {
    window.localStorage.setItem(HISTORY_KEY, "[]");
    window.dispatchEvent(new Event("awpa:history"));
  }, []);

  return { history, remove, clear };
}
