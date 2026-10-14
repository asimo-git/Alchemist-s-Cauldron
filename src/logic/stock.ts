import { randomInt } from '../utils/helpers';
import { INGREDIENTS } from '../data/ingredients';
import { MAX_STOCK, MIN_STOCK } from '../data/game';

export type Stock = Record<string, number>;

export function createShelfStock(): Stock {
  const stock: Stock = {};
  for (const { id } of INGREDIENTS.slice(0, 6)) stock[id] = randomInt(MIN_STOCK, MAX_STOCK);
  return stock;
}

export const takePortion = (stock: Stock, id: string): Stock => ({
  ...stock,
  [id]: (stock[id] ?? 0) - 1,
});
