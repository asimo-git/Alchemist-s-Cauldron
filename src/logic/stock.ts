import { randomInt } from '../utils/helpers';
import { INGREDIENTS } from '../data/ingredients';
import { MAX_STOCK, MIN_STOCK } from '../data/game';
import type { IGameState, IIngredient } from '../utils/types';
import { getState } from '../state/game-state';
import { canAddToCauldron } from './calculate-cauldron';

export type Stock = Record<string, number>;

function pickShelfIngredients(count: number): IIngredient[] {
  const pool = [...INGREDIENTS];

  for (let index = 0; index < count; index++) {
    const randomIndex = randomInt(index, pool.length - 1);
    const ingredient = pool[index]!;
    pool[index] = pool[randomIndex]!;
    pool[randomIndex] = ingredient;
  }

  return pool.slice(0, count);
}

export const getShelfIngredients = (): readonly IIngredient[] => {
  const ids = Object.keys(getState().shelfStock);
  return INGREDIENTS.filter((item) => ids.includes(item.id));
};

export function createShelfStock(shelfIngredients: number): Stock {
  const stock: Stock = {};
  for (const { id } of pickShelfIngredients(shelfIngredients)) {
    stock[id] = randomInt(MIN_STOCK, MAX_STOCK);
  }
  return stock;
}

export const takePortion = (stock: Stock, id: string): Stock => ({
  ...stock,
  [id]: (stock[id] ?? 0) - 1,
});

export function isShelfEmpty(shelfStock: Record<string, number>): boolean {
  return Object.values(shelfStock).every((count) => count === 0);
}

export function isOutOfIngredients(state: IGameState): boolean {
  return state.cauldronIngredients.length === 0 && isShelfEmpty(state.shelfStock);
}

export const canDrag = (ingredient: IIngredient): boolean => {
  const { shelfStock, cauldronIngredients } = getState();
  return (shelfStock[ingredient.id] ?? 0) > 0 && canAddToCauldron(cauldronIngredients);
};
