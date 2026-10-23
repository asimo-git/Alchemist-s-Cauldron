import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRecipe } from '../src/utils/types';

// The countdown is NOT mocked: it runs for real on fake timers.
const mocks = vi.hoisted(() => ({
  isOutOfIngredients: vi.fn(),
  isBrewSuccess: vi.fn(),
  getRecipesByDifficulty: vi.fn(),
}));

vi.mock('../src/logic/stock', () => ({
  createShelfStock: () => ({ a: 2, b: 2 }),
  takePortion: (stock: Record<string, number>, id: string) => ({ ...stock, [id]: stock[id]! - 1 }),
  isOutOfIngredients: mocks.isOutOfIngredients,
}));
vi.mock('../src/logic/recipe-generator', () => ({
  getRecipesByDifficulty: mocks.getRecipesByDifficulty,
}));
vi.mock('../src/logic/brew-check', () => ({ isBrewSuccess: mocks.isBrewSuccess }));
vi.mock('../src/logic/reactions', () => ({
  pickReactionsForGame: () => [],
  getReactionsByIds: () => [],
  getFiredReactions: () => [],
  mergeSideEffects: () => ({ timeDelta: 0, lives: 0, clearCauldron: false }),
  describeReaction: vi.fn(),
}));
vi.mock('../src/logic/game-save', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(),
  clearSave: vi.fn(),
}));
vi.mock('../src/ui/components/dialogs/game-over-dialog', () => ({ openGameOverDialog: vi.fn() }));
vi.mock('../src/ui/components/dialogs/pause-dialog', () => ({ openPauseDialog: vi.fn() }));
vi.mock('../src/data/ingredients', () => ({
  INGREDIENTS: [
    { id: 'a', name: 'A', icon: '', temperature: 1, density: 1, magicPower: 1 },
    { id: 'b', name: 'B', icon: '', temperature: 2, density: 2, magicPower: 2 },
  ],
}));

import { gameActions } from '../src/state/game-controller';
import { beforeStartState, getSettings, getState, store } from '../src/state/game-state';

const RECIPE: IRecipe = {
  id: 'r1',
  name: 'Recipe',
  difficulty: 'easy',
  temperature: { min: 0, max: 10 },
  density: { min: 0, max: 10 },
  magicPower: { min: 0, max: 10 },
};
const NEXT_RECIPE: IRecipe = { ...RECIPE, id: 'r2' };

beforeEach(() => {
  vi.useFakeTimers();
  mocks.isOutOfIngredients.mockReturnValue(false);
  mocks.isBrewSuccess.mockReturnValue(true);
  mocks.getRecipesByDifficulty.mockReturnValue(RECIPE);
  store.state = { ...beforeStartState };
  gameActions.startNewGame();
});

afterEach(() => {
  gameActions.exitToMenu();
  vi.useRealTimers();
});

describe('game start', () => {
  it('starts a playing game with settings values', () => {
    expect(getState()).toMatchObject({
      status: 'playing',
      score: 0,
      lives: getSettings().lives,
      timeLeft: getSettings().startTime,
      cauldronIngredients: [],
    });
    expect(getState().activeRecipe).toBe(RECIPE);
  });
});

describe('addToCauldron', () => {
  it('adds an ingredient and takes a portion from the shelf', () => {
    gameActions.addToCauldron('a');

    expect(getState().cauldronIngredients.map((i) => i.id)).toEqual(['a']);
    expect(getState().shelfStock.a).toBe(1);
  });

  it('does not add an ingredient that is out of stock', () => {
    store.state = { ...store.state, shelfStock: { a: 0, b: 2 } };

    gameActions.addToCauldron('a');

    expect(getState().cauldronIngredients).toEqual([]);
  });

  it('does not add an ingredient to a full cauldron', () => {
    const capacity = getSettings().cauldronCapacity;
    store.state = { ...store.state, shelfStock: { a: capacity + 1, b: 0 } };

    for (let i = 0; i < capacity + 1; i++) gameActions.addToCauldron('a');

    expect(getState().cauldronIngredients).toHaveLength(capacity);
  });
});

describe('brew', () => {
  beforeEach(() => gameActions.addToCauldron('a'));

  it('on success adds score, empties the cauldron and picks a new recipe', () => {
    mocks.getRecipesByDifficulty.mockReturnValue(NEXT_RECIPE);

    gameActions.brew();

    expect(getState().score).toBe(getSettings().scorePerBrew);
    expect(getState().cauldronIngredients).toEqual([]);
    expect(getState().activeRecipe).toBe(NEXT_RECIPE);
  });

  it('on failure costs a life and keeps the score', () => {
    mocks.isBrewSuccess.mockReturnValue(false);

    gameActions.brew();

    expect(getState().lives).toBe(getSettings().lives - 1);
    expect(getState().score).toBe(0);
    expect(getState().cauldronIngredients).toEqual([]);
  });

  it('ends the game when the last life is lost', () => {
    mocks.isBrewSuccess.mockReturnValue(false);
    store.state = { ...store.state, lives: 1 };

    gameActions.brew();

    expect(getState().status).toBe('game-over');
  });

  it('ends the game when ingredients run out', () => {
    mocks.isOutOfIngredients.mockReturnValue(true);

    gameActions.brew();

    expect(getState().status).toBe('game-over');
  });
});

describe('pourOut', () => {
  it('empties the cauldron', () => {
    gameActions.addToCauldron('a');

    gameActions.pourOut();

    expect(getState().cauldronIngredients).toEqual([]);
  });
});

describe('pause / resume', () => {
  it('freezes the timer while paused and runs it after resume', () => {
    gameActions.pauseGame();
    const frozen = getState().timeLeft;
    vi.advanceTimersByTime(5000);
    expect(getState().status).toBe('paused');
    expect(getState().timeLeft).toBe(frozen);

    gameActions.resumeGame();
    vi.advanceTimersByTime(5000);
    expect(getState().status).toBe('playing');
    expect(getState().timeLeft).toBeLessThan(frozen);
  });
});

describe('countdown', () => {
  it('ends the game when the time runs out', () => {
    vi.advanceTimersByTime((getSettings().startTime + 2) * 1000);

    expect(getState().status).toBe('game-over');
  });
});

describe('exitToMenu', () => {
  it('returns to the menu and keeps the difficulty', () => {
    gameActions.setDifficulty('hard');

    gameActions.exitToMenu();

    expect(getState()).toMatchObject({ status: 'menu', score: 0, difficulty: 'hard' });
  });
});
