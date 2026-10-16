import type { IIngredient, IRecipe } from '../utils/types';
import { STATS } from '../data/game';
import { getSettings } from '../state/game-state';

export interface IBarData {
  key: (typeof STATS)[number]['key'];
  value: number;
  limit: number; // => [-limit; +limit]
  zoneStart: number; // %
  zoneWidth: number; // %
  markerPosition: number; // %
  inRange: boolean;
}

export const canAddToCauldron = (cauldron: IIngredient[]): boolean =>
  cauldron.length < getSettings().cauldronCapacity;

export function calculateCauldron(ingredients: IIngredient[], recipe: IRecipe): IBarData[] {
  return STATS.map(({ key }) => {
    const { min, max } = recipe[key];
    const value = ingredients.reduce((sum, item) => sum + item[key], 0);

    const limit = Math.max(Math.abs(min), Math.abs(max)) * 2;
    const toPercent = (v: number): number =>
      ((Math.min(limit, Math.max(-limit, v)) + limit) / (2 * limit)) * 100;

    return {
      key,
      value,
      limit,
      zoneStart: toPercent(min),
      zoneWidth: toPercent(max) - toPercent(min),
      markerPosition: toPercent(value),
      inRange: value >= min && value <= max,
    };
  });
}
