import type { IIngredient } from '../utils/types';
import { CAULDRON_CAPACITY } from '../data/game';

export const canAddToCauldron = (cauldron: IIngredient[]): boolean =>
  cauldron.length < CAULDRON_CAPACITY;
