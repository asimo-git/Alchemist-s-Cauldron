import {
  DIFFICULTIES,
  MAX_ENTRIES,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  NAME_PATTERN,
  TOP_STORAGE_KEY,
} from '../data/game';
import { translate } from '../i18n';
import { getStorageItem } from '../utils/storage';
import type { Difficulty, ILeaderboardEntry } from '../utils/types';

export type SaveStatus = 'saved' | 'failed';

export function validatePlayerName(name: string): string | undefined {
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return translate('error.nameLength', { min: MIN_NAME_LENGTH, max: MAX_NAME_LENGTH });
  }
  if (!NAME_PATTERN.test(name)) {
    return translate('error.namePattern');
  }
  return undefined;
}

const storageKey = (difficulty: Difficulty): string => `${TOP_STORAGE_KEY}-${difficulty}`;

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

function isValidEntry(item: unknown, difficulty: Difficulty): item is ILeaderboardEntry {
  if (typeof item !== 'object' || item === null) return false;
  const { name, score, date, difficulty: entryDifficulty } = item as Record<string, unknown>;

  return (
    typeof name === 'string' &&
    validatePlayerName(name) === undefined &&
    typeof score === 'number' &&
    Number.isSafeInteger(score) &&
    score >= 0 &&
    typeof date === 'number' &&
    Number.isFinite(new Date(date).getTime()) &&
    entryDifficulty === difficulty
  );
}

const readEntries = (difficulty: Difficulty): ILeaderboardEntry[] =>
  (getStorageItem(storageKey(difficulty), isArray) ?? []).filter(
    (item): item is ILeaderboardEntry => isValidEntry(item, difficulty),
  );

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
  sortTop(readEntries(difficulty));

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
