import { STATS } from '../data/game';
import { getSettings } from '../state/game-state';
import type { IIngredient, IReaction, IRecipe } from '../utils/types';
import { calculateCauldronValues } from './calculate-cauldron';

export function isBrewSuccess(
  cauldronIngredients: IIngredient[],
  recipe: IRecipe,
  reactions: IReaction[],
): boolean {
  const tolerance = getSettings().recipeTolerance;
  const values = calculateCauldronValues(cauldronIngredients, reactions);

  return STATS.every(({ key }) => {
    const { min, max } = recipe[key];
    return values[key] >= min - tolerance && values[key] <= max + tolerance;
  });
}
