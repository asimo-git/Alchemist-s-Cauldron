export const SHELF_SIZE = 6;
export const MIN_STOCK = 2;
export const MAX_STOCK = 15;
export const CAULDRON_CAPACITY = 4;
export const BREW_TOLERANCE = 8; // Level 1
export const SCORE_PER_RECIPE = 200;
export const BREW_TIME_BONUS = 10;

export const STATS = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'density', label: 'Density' },
  { key: 'magicPower', label: 'Magic Power' },
] as const;
