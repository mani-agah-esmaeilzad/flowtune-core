"use client";

import type { ToolType, ToolResponseMap } from "@/lib/types/music";

const STORAGE_KEY = "flowtune:last-patterns";
export type PersistedType = ToolType;

export function savePattern<T extends PersistedType>(type: T, data: ToolResponseMap[T]) {
  if (typeof window === "undefined" || !data) return;
  const existing = loadAll();
  existing[type] = data;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function loadPattern<T extends PersistedType>(type: T): ToolResponseMap[T] | null {
  const all = loadAll();
  return (all[type] as ToolResponseMap[T]) ?? null;
}

export function loadAll(): Partial<Record<PersistedType, unknown>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Record<PersistedType, unknown>>;
  } catch (error) {
    console.error("Failed to load patterns", error);
    return {};
  }
}
