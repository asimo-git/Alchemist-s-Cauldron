import type { Difficulty, IDifficultySettings, IGameState } from '../utils/types';

export const MIN_STOCK = 2;
export const MAX_STOCK = 15;
export const SAVE_STORAGE_KEY = 'alchemy-saved-game';
export const INGREDIENT_DRAG_ID = 'shelf-ingredient-id';
export const BAR_LIMIT = 100;

// Timer
export const LOW_TIME_THRESHOLD = 15;
export const POUR_OUT_COST_SECONDS = -10;

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

export const GAME_EVENTS = {
  status: 'status-changed',
  score: 'score-changed',
  timeLeft: 'time-left-changed',
  lives: 'lives-changed',
  activeRecipe: 'active-recipe-changed',
  cauldronIngredients: 'cauldron-changed',
  shelfStock: 'shelf-stock-changed',
  difficulty: 'difficulty-changed',
  lastReactionId: 'last-reaction-changed',
  activeReactionIds: 'active-reactions-changed',
} as const satisfies Record<keyof IGameState, string>;

export const GAME_SIGNALS = {
  cauldronFull: 'cauldron-full',
  gameBegun: 'game-begun',
  reactionFired: 'reaction-fired',
  brewSuccess: 'brew-success',
  brewFailed: 'brew-failed',
} as const;

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const DEFAULT_DIFFICULTY: Difficulty = 'easy';

export const DIFFICULTY_SETTINGS: Record<Difficulty, IDifficultySettings> = {
  easy: {
    shelfIngredients: 4,
    cauldronCapacity: 4,
    startTime: 180,
    recipeTolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonus: 15,
    reactions: 0,
  },
  medium: {
    shelfIngredients: 6,
    cauldronCapacity: 4,
    startTime: 150,
    recipeTolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonus: 10,
    reactions: 2,
  },
  hard: {
    shelfIngredients: 8,
    cauldronCapacity: 5,
    startTime: 150,
    recipeTolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonus: 5,
    reactions: 3,
  },
};
