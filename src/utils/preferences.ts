import { getStorageItem } from './storage';

const STORAGE_KEY = 'alchemy-preferences';

export type PreferenceKey = 'locale' | 'difficulty';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const preferences: Record<string, unknown> = getStorageItem(STORAGE_KEY, isRecord) ?? {};

export function getPreference<T>(
  key: PreferenceKey,
  isValid: (value: unknown) => value is T,
): T | undefined {
  const value = preferences[key];
  return isValid(value) ? value : undefined;
}

export function setPreference(key: PreferenceKey, value: string): void {
  preferences[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    console.error('Failed to save preferences');
  }
}
