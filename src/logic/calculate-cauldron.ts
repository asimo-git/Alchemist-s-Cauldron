import type { IIngredient, IRecipe } from '../utils/types';
import { CAULDRON_CAPACITY, STATS } from '../data/game';

export interface IBarData {
  key: (typeof STATS)[number]['key'];
  value: number;
  limit: number; // шкала: [-limit; +limit]
  zoneStart: number; // % от левого края шкалы
  zoneWidth: number; // %
  markerPosition: number; // %
  inRange: boolean;
}

export const canAddToCauldron = (cauldron: IIngredient[]): boolean =>
  cauldron.length < CAULDRON_CAPACITY;

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
