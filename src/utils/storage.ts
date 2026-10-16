export function getStorageItem<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | undefined {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) return undefined;

    const parsed: unknown = JSON.parse(raw);

    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
