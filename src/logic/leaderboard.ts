import {
  MAX_ENTRIES,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  NAME_PATTERN,
  TOP_STORAGE_KEY,
} from '../data/game';
import { getStorageItem } from '../utils/storage';
import type { ILeaderboardEntry } from '../utils/types';

export type SaveStatus = 'saved' | 'failed';

const isValidLeaderboard = (value: unknown): value is ILeaderboardEntry[] =>
  Array.isArray(value) &&
  value.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const { name, score, date } = item as Record<string, unknown>;
    return (
      typeof name === 'string' &&
      typeof score === 'number' &&
      Number.isFinite(score) &&
      typeof date === 'number' &&
      Number.isFinite(date)
    );
  });

const getSortedTop = (entries: ILeaderboardEntry[]): ILeaderboardEntry[] =>
  entries.toSorted((a, b) => b.score - a.score || a.date - b.date).slice(0, MAX_ENTRIES);

function saveEntries(entries: ILeaderboardEntry[]): SaveStatus {
  try {
    localStorage.setItem(TOP_STORAGE_KEY, JSON.stringify(entries));
    return 'saved';
  } catch {
    return 'failed';
  }
}

export const getLeaderboard = (): ILeaderboardEntry[] =>
  getSortedTop(getStorageItem(TOP_STORAGE_KEY, isValidLeaderboard) ?? []);

export function isTopScore(score: number): boolean {
  const entries = getLeaderboard();
  const lastScore = entries.at(-1)?.score ?? 0;

  return score > 0 && (entries.length < MAX_ENTRIES || score > lastScore);
}

export function validatePlayerName(name: string): string | undefined {
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return `Name must be ${MIN_NAME_LENGTH}–${MAX_NAME_LENGTH} characters long`;
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Use only letters, digits, spaces, "_" and "-"';
  }
  return undefined;
}

export const addLeaderboardEntry = (name: string, score: number): SaveStatus =>
  saveEntries(getSortedTop([...getLeaderboard(), { name, score, date: Date.now() }]));

export const clearLeaderboard = (): SaveStatus => saveEntries([]);

const pad = (value: number): string => String(value).padStart(2, '0');

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
