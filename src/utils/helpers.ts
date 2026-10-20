import type { IngridientsID } from '../data/ingredients';
import type { IIngredient, IReactionValues } from './types';

export interface CreateElementOptions {
  className?: string;
  textContent?: string;
  attributes?: Record<string, string>;
  children?: Node[];
  events?: Record<string, EventListener>;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: CreateElementOptions = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  const { className, textContent, attributes, children, events } = options;

  if (className) {
    element.className = className;
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  }

  if (events) {
    for (const [type, listener] of Object.entries(events)) {
      element.addEventListener(type, listener);
    }
  }

  if (children) {
    element.append(...children);
  }

  return element;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(array: T[]): T | undefined {
  if (array.length === 0) return;
  const index = randomInt(0, array.length - 1);
  return array[index];
}

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isSafeInteger(value);

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const changeByPercent = (value: number, percent: number): number =>
  Math.round(value * (1 + percent / 100));

export const hasAllIngridients = (ingredients: IIngredient[], ids: IngridientsID[]): boolean =>
  ids.every((id) => ingredients.some((item) => item.id === id));

export const getTotal = (ingredients: IIngredient[], key: keyof IReactionValues): number =>
  ingredients.reduce((sum, item) => sum + item[key], 0);
