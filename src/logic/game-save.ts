import { DIFFICULTIES, SAVE_STORAGE_KEY } from '../data/game';
import { INGREDIENTS } from '../data/ingredients';
import { getSettings } from '../state/game-state';
import { isNonNegativeNumber, isPlainObject } from '../utils/helpers';
import { getStorageItem } from '../utils/storage';
import type { IGameState, IRecipe } from '../utils/types';

//a valid prescription is required
export type SavedGame = Omit<IGameState, 'activeRecipe'> & {
  activeRecipe: IRecipe;
};

const isRange = (value: unknown): boolean =>
  isPlainObject(value) &&
  typeof value.min === 'number' &&
  typeof value.max === 'number' &&
  Number.isFinite(value.min) &&
  Number.isFinite(value.max) &&
  value.min <= value.max;

const isRecipe = (value: unknown): boolean =>
  isPlainObject(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.difficulty === 'string' &&
  (DIFFICULTIES as readonly string[]).includes(value.difficulty) &&
  isRange(value.temperature) &&
  isRange(value.density) &&
  isRange(value.magicPower);

export function isValidSave(data: unknown): data is SavedGame {
  if (!isPlainObject(data)) return false;

  const {
    status,
    difficulty,
    score,
    timeLeft,
    lives,
    activeRecipe,
    cauldronIngredients,
    shelfStock,
  } = data;

  return (
    (status === 'playing' || status === 'paused') &&
    typeof difficulty === 'string' &&
    (DIFFICULTIES as readonly string[]).includes(difficulty) &&
    isNonNegativeNumber(score) &&
    isNonNegativeNumber(timeLeft) &&
    isNonNegativeNumber(lives) &&
    lives <= getSettings().lives &&
    isRecipe(activeRecipe) &&
    Array.isArray(cauldronIngredients) &&
    cauldronIngredients.every(
      (item) => isPlainObject(item) && INGREDIENTS.some((ingredient) => ingredient.id === item.id),
    ) &&
    isPlainObject(shelfStock) &&
    Object.values(shelfStock).every((portions) => isNonNegativeNumber(portions))
  );
}

export function saveGame(state: Readonly<IGameState>): void {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save game');
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    console.error('Failed to clear game save');
  }
}

export function loadGame(): SavedGame | undefined {
  const save = getStorageItem(SAVE_STORAGE_KEY, isValidSave);

  if (!save) {
    clearSave();
    return undefined;
  }

  return save;
}
