"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEmptyResume,
  type ResumeData,
} from "@/lib/resume/schema";

const STORAGE_KEY = "ats-resume-builder:draft:v1";

export function useResumeDraft() {
  const [data, setData] = useState<ResumeData>(() => createEmptyResume());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ResumeData;
        setData({ ...createEmptyResume(), ...parsed, focus: "geral" });
      }
    } catch {
      // ignore corrupt drafts
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const reset = useCallback(() => {
    setData(createEmptyResume());
  }, []);

  const loadDemo = useCallback((demo: ResumeData) => {
    setData({ ...demo, focus: "geral" });
  }, []);

  return { data, setData, hydrated, reset, loadDemo };
}
