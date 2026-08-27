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
};

const listeners = new Set<() => void>();

let store: DraftStore = {
  data: createEmptyResume(),
  hydrated: false,
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
  };
}

function getSnapshot(): DraftStore {
  ensureHydrated();
  return store;
}

function getServerSnapshot(): DraftStore {
  return {
    data: createEmptyResume(),
    hydrated: false,
  };
}

function writeDraft(next: ResumeData) {
  ensureHydrated();
  store = { data: next, hydrated: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
  emit();
}

export function useResumeDraft() {
  const { data, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setData = useCallback((value: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    const prev = getSnapshot().data;
    const next = typeof value === "function" ? value(prev) : value;
    writeDraft(next);
  }, []);

  const reset = useCallback(() => {
    writeDraft(createEmptyResume());
  }, []);

  const loadDemo = useCallback((demo: ResumeData) => {
    writeDraft({ ...demo, focus: "geral" });
  }, []);

  return { data, setData, hydrated, reset, loadDemo };
}
