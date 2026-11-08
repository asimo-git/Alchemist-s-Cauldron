import type { IRecipe } from '../utils/types';

export const RECIPES: readonly IRecipe[] = [
  // ---- Easy (±12) ----
  {
    id: 'pale-dew',
    name: 'Pale Dew',
    difficulty: 'easy',
    temperature: { min: -4, max: 12 },
    density: { min: 4, max: 20 },
    magicPower: { min: 14, max: 30 },
  }, // 93%
  {
    id: 'amber-silt',
    name: 'Amber Silt',
    difficulty: 'easy',
    temperature: { min: 12, max: 28 },
    density: { min: 26, max: 42 },
    magicPower: { min: 44, max: 60 },
  }, // 86%
  {
    id: 'warm-gloom',
    name: 'Warm Gloom',
    difficulty: 'easy',
    temperature: { min: 12, max: 28 },
    density: { min: 16, max: 32 },
    magicPower: { min: 28, max: 44 },
  }, // 84%
  {
    id: 'dawn-haze',
    name: 'Dawn Haze',
    difficulty: 'easy',
    temperature: { min: 10, max: 26 },
    density: { min: 12, max: 28 },
    magicPower: { min: 16, max: 32 },
  }, // 89%
  {
    id: 'soft-ember',
    name: 'Soft Ember',
    difficulty: 'easy',
    temperature: { min: 4, max: 20 },
    density: { min: 4, max: 20 },
    magicPower: { min: 12, max: 28 },
  }, // 92%
  {
    id: 'dusk-resin',
    name: 'Dusk Resin',
    difficulty: 'easy',
    temperature: { min: 16, max: 32 },
    density: { min: 28, max: 44 },
    magicPower: { min: 36, max: 52 },
  }, // 80%
  {
    id: 'gold-vapor',
    name: 'Gold Vapor',
    difficulty: 'easy',
    temperature: { min: 20, max: 36 },
    density: { min: 20, max: 36 },
    magicPower: { min: 34, max: 50 },
  }, // 81%
  {
    id: 'quiet-root',
    name: 'Quiet Root',
    difficulty: 'easy',
    temperature: { min: 4, max: 20 },
    density: { min: 14, max: 30 },
    magicPower: { min: 28, max: 44 },
  }, // 84%

  // ---- Medium (±8) ----
  {
    id: 'acid-spark',
    name: 'Acid Spark',
    difficulty: 'medium',
    temperature: { min: 20, max: 32 },
    density: { min: 28, max: 40 },
    magicPower: { min: 42, max: 54 },
  }, // 98%
  {
    id: 'dragon-mist',
    name: 'Dragon Mist',
    difficulty: 'medium',
    temperature: { min: 6, max: 18 },
    density: { min: 2, max: 14 },
    magicPower: { min: 6, max: 18 },
  }, // 88%
  {
    id: 'frost-acid',
    name: 'Frost Acid',
    difficulty: 'medium',
    temperature: { min: -4, max: 8 },
    density: { min: 22, max: 34 },
    magicPower: { min: 44, max: 56 },
  }, // 88%
  {
    id: 'ember-soup',
    name: 'Ember Soup',
    difficulty: 'medium',
    temperature: { min: 40, max: 52 },
    density: { min: 30, max: 42 },
    magicPower: { min: 44, max: 56 },
  }, // 87%
  {
    id: 'moon-brine',
    name: 'Moon Brine',
    difficulty: 'medium',
    temperature: { min: 8, max: 20 },
    density: { min: 12, max: 24 },
    magicPower: { min: 26, max: 38 },
  }, // 93%
  {
    id: 'dusk-venom',
    name: 'Dusk Venom',
    difficulty: 'medium',
    temperature: { min: 18, max: 30 },
    density: { min: 34, max: 46 },
    magicPower: { min: 56, max: 68 },
  }, // 86%
  {
    id: 'grave-pulse',
    name: 'Grave Pulse',
    difficulty: 'medium',
    temperature: { min: -6, max: 6 },
    density: { min: 18, max: 30 },
    magicPower: { min: 30, max: 42 },
  }, // 88%
  {
    id: 'storm-silt',
    name: 'Storm Silt',
    difficulty: 'medium',
    temperature: { min: 8, max: 20 },
    density: { min: 24, max: 36 },
    magicPower: { min: 42, max: 54 },
  }, // 96%

  // ---- Hard (±5) ----
  {
    id: 'void-flame',
    name: 'Void Flame',
    difficulty: 'hard',
    temperature: { min: 21, max: 31 },
    density: { min: 37, max: 47 },
    magicPower: { min: 61, max: 71 },
  }, // 99%
  {
    id: 'sunken-orchid',
    name: 'Sunken Orchid',
    difficulty: 'hard',
    temperature: { min: -17, max: -7 },
    density: { min: 39, max: 49 },
    magicPower: { min: 75, max: 85 },
  }, // 88%
  {
    id: 'grave-eclipse',
    name: 'Grave Eclipse',
    difficulty: 'hard',
    temperature: { min: 15, max: 25 },
    density: { min: 15, max: 25 },
    magicPower: { min: 27, max: 37 },
  }, // 93%
  {
    id: 'ember-troll',
    name: 'Ember Troll',
    difficulty: 'hard',
    temperature: { min: 53, max: 63 },
    density: { min: 41, max: 51 },
    magicPower: { min: 55, max: 65 },
  }, // 89%
  {
    id: 'frozen-ash',
    name: 'Frozen Ash',
    difficulty: 'hard',
    temperature: { min: -13, max: -3 },
    density: { min: 15, max: 25 },
    magicPower: { min: 35, max: 45 },
  }, // 90%
  {
    id: 'triple-eclipse',
    name: 'Triple Eclipse',
    difficulty: 'hard',
    temperature: { min: 5, max: 15 },
    density: { min: 47, max: 57 },
    magicPower: { min: 85, max: 95 },
  }, // 88%
  {
    id: 'phoenix-pulse',
    name: 'Phoenix Pulse',
    difficulty: 'hard',
    temperature: { min: 41, max: 51 },
    density: { min: 43, max: 53 },
    magicPower: { min: 75, max: 85 },
  }, // 88%
  {
    id: 'slime-crown',
    name: 'Slime Crown',
    difficulty: 'hard',
    temperature: { min: -9, max: 1 },
    density: { min: 27, max: 37 },
    magicPower: { min: 55, max: 65 },
  }, // 95%
];
