import { MAX_ENTRIES, STORAGE_KEY } from '../data/game';
import { getStorageItem } from '../utils/storage';
import type { ILeaderboardEntry } from '../utils/types';

const MOCK_ENTRIES: ILeaderboardEntry[] = [
  { name: 'Morgana', score: 980, date: new Date(2026, 9, 1, 21, 15).getTime() },
  { name: 'Merlin', score: 910, date: new Date(2026, 9, 3, 18, 40).getTime() },
  { name: 'Nyx', score: 910, date: new Date(2026, 9, 5, 12, 5).getTime() },
  { name: 'Paracelsus', score: 840, date: new Date(2026, 9, 6, 9, 30).getTime() },
  { name: 'Hecate', score: 790, date: new Date(2026, 9, 8, 23, 59).getTime() },
  { name: 'Grimm', score: 720, date: new Date(2026, 9, 9, 14, 20).getTime() },
  { name: 'Salem', score: 655, date: new Date(2026, 9, 10, 20, 0).getTime() },
  { name: 'Vesper', score: 590, date: new Date(2026, 9, 11, 7, 45).getTime() },
  { name: 'Raven', score: 480, date: new Date(2026, 9, 12, 16, 10).getTime() },
  { name: 'Ash', score: 350, date: new Date(2026, 9, 13, 11, 25).getTime() },
];

const isEntry = (value: unknown): value is ILeaderboardEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const { name, score, date } = value as Record<string, unknown>;
  return (
    typeof name === 'string' &&
    typeof score === 'number' &&
    Number.isFinite(score) &&
    typeof date === 'number' &&
    Number.isFinite(date)
  );
};

const isEntries = (value: unknown): value is ILeaderboardEntry[] =>
  Array.isArray(value) && value.every((item) => isEntry(item));

const normalize = (entries: ILeaderboardEntry[]): ILeaderboardEntry[] =>
  entries.toSorted((a, b) => b.score - a.score || a.date - b.date).slice(0, MAX_ENTRIES);

function saveEntries(entries: ILeaderboardEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // error
  }
}

export const getLeaderboard = (): ILeaderboardEntry[] =>
  normalize(getStorageItem(STORAGE_KEY, isEntries) ?? MOCK_ENTRIES);

export const addLeaderboardEntry = (name: string, score: number): void =>
  saveEntries(normalize([...getLeaderboard(), { name, score, date: Date.now() }]));

export const clearLeaderboard = (): void => saveEntries([]);

const pad = (value: number): string => String(value).padStart(2, '0');

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
