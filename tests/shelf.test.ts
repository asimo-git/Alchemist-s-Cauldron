import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
});

vi.mock('../src/ui/components/dialogs/game-over-dialog', () => ({ openGameOverDialog: vi.fn() }));
vi.mock('../src/ui/components/dialogs/pause-dialog', () => ({ openPauseDialog: vi.fn() }));

import { createShelfSection } from '../src/ui/components/shelf';
import { gameActions } from '../src/state/game-controller';
import { beforeStartState, getSettings, getState, store } from '../src/state/game-state';
import { INGREDIENTS } from '../src/data/ingredients';
import { DIFFICULTIES, DIFFICULTY_SETTINGS, MAX_STOCK, MIN_STOCK } from '../src/data/game';
import type { Difficulty } from '../src/utils/types';

let shelf: HTMLElement;

const getCards = (): HTMLButtonElement[] => [
  ...shelf.querySelectorAll<HTMLButtonElement>('.shelf_card'),
];

const getBadge = (card: HTMLElement): number =>
  Number(card.querySelector('.shelf_card_stock')!.textContent);

function startGame(difficulty: Difficulty): void {
  gameActions.setDifficulty(difficulty);
  gameActions.startNewGame();
}

beforeEach(() => {
  document.body.replaceChildren();
  store.state = { ...beforeStartState };
  shelf = createShelfSection();
  document.body.append(shelf);
});

afterEach(() => {
  gameActions.exitToMenu();
});

describe('shelf before the game starts', () => {
  it('is empty in the menu', () => {
    expect(getCards()).toHaveLength(0);
  });

  it('is cleared when exiting to the menu', () => {
    startGame('easy');
    expect(getCards().length).toBeGreaterThan(0);

    gameActions.exitToMenu();

    expect(getCards()).toHaveLength(0);
  });
});

describe.each(DIFFICULTIES)('shelf on %s difficulty', (difficulty) => {
  beforeEach(() => startGame(difficulty));

  it('has as many ingredients as the difficulty settings define', () => {
    const expected = DIFFICULTY_SETTINGS[difficulty].shelfIngredients;

    expect(getCards()).toHaveLength(expected);
    expect(Object.keys(getState().shelfStock)).toHaveLength(expected);
  });

  it('only shows known ingredients', () => {
    const known = INGREDIENTS.map((item) => item.name);

    for (const card of getCards()) {
      expect(known).toContain(card.querySelector('.shelf_card_name')!.textContent);
    }
  });

  it('keeps each stock between MIN_STOCK and MAX_STOCK', () => {
    for (const card of getCards()) {
      expect(getBadge(card)).toBeGreaterThanOrEqual(MIN_STOCK);
      expect(getBadge(card)).toBeLessThanOrEqual(MAX_STOCK);
    }
  });

  it('adds an ingredient to the cauldron on click and updates the stock', () => {
    const card = getCards()[0]!;
    const name = card.querySelector('.shelf_card_name')!.textContent;
    const stockBefore = getBadge(card);

    card.click();

    expect(getState().cauldronIngredients).toHaveLength(1);
    expect(getState().cauldronIngredients[0]!.name).toBe(name);
    expect(getBadge(card)).toBe(stockBefore - 1);
  });

  it('never puts more ingredients into the cauldron than its capacity and locks the shelf', () => {
    const capacity = getSettings().cauldronCapacity;
    expect(capacity).toBe(DIFFICULTY_SETTINGS[difficulty].cauldronCapacity);

    for (let round = 0; round < capacity; round++) getCards().forEach((card) => card.click());

    expect(getState().cauldronIngredients).toHaveLength(capacity);
    expect(shelf.classList.contains('shelf_container_isLocked')).toBe(true);
  });
});
