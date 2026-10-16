import type { Difficulty, IGameState } from '../utils/types';

export const SHELF_SIZE = 6;
export const MIN_STOCK = 2;
export const MAX_STOCK = 15;
export const CAULDRON_CAPACITY = 4;
export const BREW_TOLERANCE = 8; // Level 1
export const SCORE_PER_RECIPE = 200;
export const SAVE_STORAGE_KEY = 'alchemy-saved-game';

// Timer
export const BREW_TIME_BONUS = 10;
export const LEVEL_1_TIME = 150;
export const LEVEL_1_LIVES = 3;
export const LOW_TIME_THRESHOLD = 15;

// Leaderboard
export const TOP_STORAGE_KEY = 'alchemy-leaderboard';
export const MAX_ENTRIES = 10;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 15;
export const NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;

export const STATS = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'density', label: 'Density' },
  { key: 'magicPower', label: 'Magic Power' },
] as const;

export const SAVE_TRIGGER_KEYS: Set<keyof IGameState> = new Set([
  'status',
  'score',
  'lives',
  'activeRecipe',
  'cauldronIngredients',
  'shelfStock',
]);

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
