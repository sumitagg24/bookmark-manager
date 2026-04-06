import type { MergeResult, ParsedFile } from '../types/bookmark';

const SESSION_KEY = 'bookmark-manager-session-v1';

export type SessionSnapshot = {
  v: 1;
  files: ParsedFile[];
  mergeResult: MergeResult | null;
};

export function loadSessionSnapshot(): SessionSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SessionSnapshot;
    if (data.v !== 1 || !Array.isArray(data.files)) return null;
    return {
      v: 1,
      files: data.files,
      mergeResult: data.mergeResult ?? null,
    };
  } catch {
    return null;
  }
}

export function saveSessionSnapshot(files: ParsedFile[], mergeResult: MergeResult | null) {
  if (typeof window === 'undefined') return;
  if (files.length === 0) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  try {
    const payload: SessionSnapshot = { v: 1, files, mergeResult };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // QuotaExceeded or private mode
  }
}

export function clearSessionSnapshot() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
