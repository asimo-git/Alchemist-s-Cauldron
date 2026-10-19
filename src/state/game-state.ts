import type { IGameState, IDifficultySettings } from '../utils/types';

import { DEFAULT_DIFFICULTY, DIFFICULTY_SETTINGS } from '../data/game';

const initialSettings = DIFFICULTY_SETTINGS[DEFAULT_DIFFICULTY];

export const beforeStartState: IGameState = {
  status: 'menu',
  score: 0,
  lives: initialSettings.lives,
  timeLeft: 0,
  activeRecipe: undefined,
  cauldronIngredients: [],
  shelfStock: {},
  difficulty: DEFAULT_DIFFICULTY,
  lastReactionId: undefined,
};

export const store: { state: IGameState } = {
  state: beforeStartState,
};

export const getState = (): Readonly<IGameState> => store.state;

export const getSettings = (): IDifficultySettings => DIFFICULTY_SETTINGS[store.state.difficulty];
