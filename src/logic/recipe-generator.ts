import { RECIPES } from '../data/recipes';
import { pickRandom } from '../utils/helpers';
import type { Difficulty, IRecipe } from '../utils/types';

export function getRecipesByDifficulty(difficulty: Difficulty): IRecipe {
  const availableRecipes = RECIPES.filter((recipe) => recipe.difficulty === difficulty);

  const activeRecipe = pickRandom(availableRecipes);

  return activeRecipe ?? RECIPES[0]!;
}
