import type { IIngredient, IReaction, IReactionValues, IRecipe } from '../utils/types';
import { BAR_LIMIT, INGREDIENT_DRAG_ID, STATS } from '../data/game';
import { getSettings, getState } from '../state/game-state';
import { getTotal } from '../utils/helpers';

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

export function calculateCauldronBars(
  ingredients: IIngredient[],
  recipe: IRecipe,
  reactions: IReaction[],
): IBarData[] {
  const values = calculateCauldronValues(ingredients, reactions);

  return STATS.map(({ key }) => {
    const { min, max } = recipe[key];
    const value = values[key];

    // const limit = Math.max(Math.abs(min), Math.abs(max)) * 2;
    const limit = BAR_LIMIT;
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

export function canAcceptDrag(event: Event): boolean {
  const { status, cauldronIngredients } = getState();
  return (
    status === 'playing' &&
    canAddToCauldron(cauldronIngredients) &&
    event instanceof DragEvent &&
    event.dataTransfer !== null &&
    event.dataTransfer.types.includes(INGREDIENT_DRAG_ID)
  );
}

export function calculateCauldronValues(
  ingredients: IIngredient[],
  reactions: readonly IReaction[],
): IReactionValues {
  let values: IReactionValues = {
    temperature: getTotal(ingredients, 'temperature'),
    density: getTotal(ingredients, 'density'),
    magicPower: getTotal(ingredients, 'magicPower'),
  };

  for (const reaction of reactions) {
    if (reaction.isActive(ingredients)) {
      values = reaction.apply(values);
    }
  }

  return values;
}
