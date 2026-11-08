import { getPreference, setPreference } from '../utils/preferences';
import { en } from './locales/en';
import { ru } from './locales/ru';

export const LOCALES = { en, ru } as const;
export type Locale = keyof typeof LOCALES;

const DEFAULT_LOCALE: Locale = 'en';

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && Object.hasOwn(LOCALES, value);

// 1) saved language, 2) browser language, 3) default
function detectLocale(): Locale {
  const saved = getPreference('locale', isLocale);
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
  if (next === locale) return;
  setPreference('locale', next);
  location.reload();
}

export function translate(key: string, parameters: Record<string, string | number> = {}): string {
  const { count } = parameters;
  let template: string | undefined;

  if (typeof count === 'number') {
    const specific = `${key}_${rules.select(count)}`;
    const fallback = `${key}_other`;
    template = dict[specific] ?? dict[fallback] ?? en[specific] ?? en[fallback];
  } else {
    template = dict[key] ?? en[key];
  }

  return (template ?? key).replaceAll(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(parameters, name) ? String(parameters[name]) : match,
  );
}
