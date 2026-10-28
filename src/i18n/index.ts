import { getStorageItem } from '../utils/storage';
import { en } from './locales/en';
import { ru } from './locales/ru';

export const LOCALES = { en, ru } as const;
export type Locale = keyof typeof LOCALES;

const STORAGE_KEY = 'alchemy-locale';
const DEFAULT_LOCALE: Locale = 'en';

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && Object.hasOwn(LOCALES, value);

// 1) saved language, 2) browser language, 3) default
function detectLocale(): Locale {
  const saved = getStorageItem(STORAGE_KEY, isLocale);
  if (saved) return saved;
  const browser = navigator.language.slice(0, 2);
  return isLocale(browser) ? browser : DEFAULT_LOCALE;
}

const locale = detectLocale();
const dict: Record<string, string> = LOCALES[locale];
const rules = new Intl.PluralRules(locale);

document.documentElement.lang = locale;

export const getLocale = (): Locale => locale;

export function setLocale(next: Locale): void {
  console.log(next);
  if (next === locale) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  location.reload();
}

export function translate(key: string, count?: number): string {
  let template: string | undefined;

  if (count === undefined) {
    template = dict[key] ?? en[key];
  } else {
    const specific = `${key}_${rules.select(count)}`;
    const fallback = `${key}_other`;
    template = dict[specific] ?? dict[fallback] ?? en[specific] ?? en[fallback];
  }

  const text = template ?? key;

  return count === undefined ? text : text.replaceAll('{count}', () => String(count));
}
