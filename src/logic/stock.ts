import { randomInt } from '../utils/helpers';
import { INGREDIENTS } from '../data/ingredients';
import { MAX_STOCK, MIN_STOCK } from '../data/game';
import type { IGameState } from '../utils/types';

export type Stock = Record<string, number>;

export function createShelfStock(shelfIngredients: number): Stock {
  const stock: Stock = {};
  for (const { id } of INGREDIENTS.slice(0, shelfIngredients)) {
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
