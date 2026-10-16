import { BREW_TOLERANCE, STATS } from '../data/game';
import type { IIngredient, IRecipe } from '../utils/types';

export function isBrewSuccess(
  ingredients: IIngredient[],
  recipe: IRecipe,
  tolerance = BREW_TOLERANCE,
): boolean {
  return STATS.every(({ key }) => {
    const value = ingredients.reduce((sum, item) => sum + item[key], 0);
    const { min, max } = recipe[key];
    return value >= min - tolerance && value <= max + tolerance;
  });
}
