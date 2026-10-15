export const SHELF_SIZE = 6;
export const MIN_STOCK = 2;
export const MAX_STOCK = 15;
export const CAULDRON_CAPACITY = 4;
export const BREW_TOLERANCE = 8; // Level 1
export const SCORE_PER_RECIPE = 200;

// Timer
export const BREW_TIME_BONUS = 10;
export const LEVEL_1_TIME = 150;
export const LEVEL_1_LIVES = 3;
export const LOW_TIME_THRESHOLD = 15;

// Leaderboard
export const STORAGE_KEY = 'alchemy-leaderboard';
export const MAX_ENTRIES = 10;

export const STATS = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'density', label: 'Density' },
  { key: 'magicPower', label: 'Magic Power' },
] as const;
