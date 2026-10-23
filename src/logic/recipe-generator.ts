import { RECIPES } from '../data/recipes';
import { pickRandom } from '../utils/helpers';
import type { Difficulty, IRecipe } from '../utils/types';

const state: { lastRecipeId: string | undefined } = { lastRecipeId: undefined };

export function getRecipesByDifficulty(difficulty: Difficulty): IRecipe {
  const byDifficulty = RECIPES.filter((recipe) => recipe.difficulty === difficulty);

  const candidates =
    byDifficulty.length > 1
      ? byDifficulty.filter((recipe) => recipe.id !== state.lastRecipeId)
      : byDifficulty;

  const activeRecipe = pickRandom(candidates) ?? RECIPES[0]!;

  state.lastRecipeId = activeRecipe.id;

  return activeRecipe;
}
