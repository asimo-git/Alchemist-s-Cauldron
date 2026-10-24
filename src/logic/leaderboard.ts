import {
  DIFFICULTIES,
  MAX_ENTRIES,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  NAME_PATTERN,
  TOP_STORAGE_KEY,
} from '../data/game';
import { getStorageItem } from '../utils/storage';
import type { Difficulty, ILeaderboardEntry } from '../utils/types';

export type SaveStatus = 'saved' | 'failed';

export function validatePlayerName(name: string): string | undefined {
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return `Name must be ${MIN_NAME_LENGTH}–${MAX_NAME_LENGTH} characters long`;
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Use only letters, digits, spaces, "_" and "-"';
  }
  return undefined;
}

const storageKey = (difficulty: Difficulty): string => `${TOP_STORAGE_KEY}-${difficulty}`;

const isValidEntries = (value: unknown): value is ILeaderboardEntry[] =>
  Array.isArray(value) &&
  value.every((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const { name, score, date, difficulty } = item as Record<string, unknown>;
    return (
      typeof name === 'string' &&
      typeof score === 'number' &&
      Number.isFinite(score) &&
      typeof date === 'number' &&
      Number.isFinite(date) &&
      typeof difficulty === 'string' &&
      (DIFFICULTIES as readonly string[]).includes(difficulty)
    );
  });

const compareEntries = (a: ILeaderboardEntry, b: ILeaderboardEntry): number =>
  b.score - a.score || a.date - b.date;

const sortTop = (entries: ILeaderboardEntry[]): ILeaderboardEntry[] =>
  entries.toSorted(compareEntries).slice(0, MAX_ENTRIES);

function saveEntries(difficulty: Difficulty, entries: ILeaderboardEntry[]): SaveStatus {
  try {
    localStorage.setItem(storageKey(difficulty), JSON.stringify(entries));
    return 'saved';
  } catch {
    return 'failed';
  }
}

export const getLeaderboard = (difficulty: Difficulty): ILeaderboardEntry[] =>
  sortTop(getStorageItem(storageKey(difficulty), isValidEntries) ?? []);

export function isTopScore(score: number, difficulty: Difficulty): boolean {
  const entries = getLeaderboard(difficulty);
  const lastScore = entries.at(-1)?.score ?? 0;

  return score > 0 && (entries.length < MAX_ENTRIES || score > lastScore);
}

export const addLeaderboardEntry = (
  name: string,
  score: number,
  difficulty: Difficulty,
): SaveStatus =>
  saveEntries(
    difficulty,
    sortTop([...getLeaderboard(difficulty), { name, score, difficulty, date: Date.now() }]),
  );

export const clearLeaderboard = (): SaveStatus =>
  DIFFICULTIES.map((difficulty) => saveEntries(difficulty, [])).includes('failed')
    ? 'failed'
    : 'saved';

const pad = (value: number): string => String(value).padStart(2, '0');

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
