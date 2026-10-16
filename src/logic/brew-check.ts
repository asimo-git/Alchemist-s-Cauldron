import { STATS } from '../data/game';
import { getSettings } from '../state/game-state';
import type { IIngredient, IRecipe } from '../utils/types';

export function isBrewSuccess(ingredients: IIngredient[], recipe: IRecipe): boolean {
  const tolerance = getSettings().recipeTolerance;
  return STATS.every(({ key }) => {
    const value = ingredients.reduce((sum, item) => sum + item[key], 0);
    const { min, max } = recipe[key];
    return value >= min - tolerance && value <= max + tolerance;
  });
}
