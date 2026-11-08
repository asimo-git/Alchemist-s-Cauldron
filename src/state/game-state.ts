import type { IGameState, IDifficultySettings, Difficulty } from '../utils/types';
import { DEFAULT_DIFFICULTY, DIFFICULTIES, DIFFICULTY_SETTINGS } from '../data/game';
import { getPreference } from '../utils/preferences';

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value);

const initialDifficulty = getPreference('difficulty', isDifficulty) ?? DEFAULT_DIFFICULTY;

const initialSettings = DIFFICULTY_SETTINGS[initialDifficulty];

export const beforeStartState: IGameState = {
  status: 'menu',
  score: 0,
  lives: initialSettings.lives,
  timeLeft: 0,
  activeRecipe: undefined,
  cauldronIngredients: [],
  shelfStock: {},
  difficulty: initialDifficulty,
  lastReactionId: undefined,
  activeReactionIds: [],
};

export const store: { state: IGameState } = {
  state: beforeStartState,
};

export const getState = (): Readonly<IGameState> => store.state;

export const getSettings = (): IDifficultySettings => DIFFICULTY_SETTINGS[store.state.difficulty];
