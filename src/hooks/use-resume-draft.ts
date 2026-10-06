"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  createEmptyResume,
  type ResumeData,
} from "@/lib/resume/schema";

const STORAGE_KEY = "ats-resume-builder:draft:v1";

type DraftStore = {
  data: ResumeData;
  hydrated: boolean;
  /** False after a localStorage write failure (quota / private mode). */
  persistOk: boolean;
};

const listeners = new Set<() => void>();

let store: DraftStore = {
  data: createEmptyResume(),
  hydrated: false,
  persistOk: true,
};

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readFromLocalStorage(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyResume();
    const parsed = JSON.parse(raw) as ResumeData;
    return { ...createEmptyResume(), ...parsed, focus: "geral" };
  } catch {
    return createEmptyResume();
  }
}

function ensureHydrated() {
  if (store.hydrated || typeof window === "undefined") return;
  store = {
    data: readFromLocalStorage(),
    hydrated: true,
    persistOk: true,
  };
}

function getSnapshot(): DraftStore {
  ensureHydrated();
  return store;
}

const serverSnapshot: DraftStore = {
  data: createEmptyResume(),
  hydrated: false,
  persistOk: true,
};

function getServerSnapshot(): DraftStore {
  return serverSnapshot;
}

/** Writes in-memory draft and attempts localStorage. Returns whether persist succeeded. */
function writeDraft(next: ResumeData): boolean {
  ensureHydrated();
  let persistOk = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    persistOk = false;
  }
  store = { data: next, hydrated: true, persistOk };
  emit();
  return persistOk;
}

export function useResumeDraft() {
  const { data, hydrated, persistOk } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setData = useCallback((value: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    const prev = getSnapshot().data;
    const next = typeof value === "function" ? value(prev) : value;
    return writeDraft(next);
  }, []);

  const reset = useCallback(() => {
    return writeDraft(createEmptyResume());
  }, []);

  const loadDemo = useCallback((demo: ResumeData) => {
    return writeDraft({ ...demo, focus: "geral" });
  }, []);

  return { data, setData, hydrated, persistOk, reset, loadDemo };
}
