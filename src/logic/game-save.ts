import { DIFFICULTIES, DIFFICULTY_SETTINGS, MAX_STOCK, SAVE_STORAGE_KEY } from '../data/game';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { isNonNegativeNumber, isPlainObject } from '../utils/helpers';
import { getStorageItem } from '../utils/storage';
import type { Difficulty, IGameState, IIngredient, IRecipe } from '../utils/types';
import { getShelfIngredients } from './stock';

//a valid prescription is required
export type SavedGame = Omit<IGameState, 'activeRecipe'> & {
  activeRecipe: IRecipe;
};

const findIngredient = (id: unknown): IIngredient | undefined =>
  INGREDIENTS.find((ingredient) => ingredient.id === id);

const findRecipe = (id: unknown): IRecipe | undefined => RECIPES.find((recipe) => recipe.id === id);

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value);

// only the id is trusted, the recipe itself is restored from RECIPES
const isKnownRecipe = (value: unknown): boolean =>
  isPlainObject(value) && findRecipe(value.id) !== undefined;

const isValidShelfStock = (value: unknown, shelfIds: string[]): boolean =>
  isPlainObject(value) &&
  Object.keys(value).length === shelfIds.length &&
  shelfIds.every((id) => {
    const portions = value[id];
    return isNonNegativeNumber(portions) && portions <= MAX_STOCK;
  });

const isValidCauldron = (value: unknown, shelfIds: string[], capacity: number): boolean =>
  Array.isArray(value) &&
  value.length <= capacity &&
  value.every(
    (item) => isPlainObject(item) && typeof item.id === 'string' && shelfIds.includes(item.id),
  );

function isValidSave(data: unknown): data is SavedGame {
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

  if (!isDifficulty(difficulty)) return false;

  const settings = DIFFICULTY_SETTINGS[difficulty];
  const shelfIds = getShelfIngredients(settings.shelfIngredients).map(({ id }) => id);

  return (
    (status === 'playing' || status === 'paused') &&
    isNonNegativeNumber(score) &&
    isNonNegativeNumber(timeLeft) &&
    timeLeft <= settings.startTime &&
    isNonNegativeNumber(lives) &&
    lives > 0 &&
    lives <= settings.lives &&
    isKnownRecipe(activeRecipe) &&
    isValidCauldron(cauldronIngredients, shelfIds, settings.cauldronCapacity) &&
    isValidShelfStock(shelfStock, shelfIds)
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
  const activeRecipe = findRecipe(save?.activeRecipe.id);

  if (!save || !activeRecipe) {
    clearSave();
    return undefined;
  }

  return {
    status: save.status,
    difficulty: save.difficulty,
    score: save.score,
    timeLeft: save.timeLeft,
    lives: save.lives,
    activeRecipe,
    cauldronIngredients: save.cauldronIngredients.flatMap(({ id }) => findIngredient(id) ?? []),
    shelfStock: save.shelfStock,
    lastReactionId: typeof save.lastReactionId === 'string' ? save.lastReactionId : undefined,
  };
}
