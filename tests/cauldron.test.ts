import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/ui/components/dialogs/game-over-dialog', () => ({ openGameOverDialog: vi.fn() }));
vi.mock('../src/ui/components/dialogs/pause-dialog', () => ({ openPauseDialog: vi.fn() }));

import { createCauldronSection } from '../src/ui/components/cauldron';
import { gameActions, gameEvents } from '../src/state/game-controller';
import { beforeStartState, getSettings, getState, store } from '../src/state/game-state';
import { GAME_SIGNALS, INGREDIENT_DRAG_ID } from '../src/data/game';
import { INGREDIENTS } from '../src/data/ingredients';

beforeAll(() => {
  vi.stubGlobal(
    'DragEvent',
    class extends Event {
      dataTransfer: unknown;
      constructor(type: string, init: { dataTransfer?: unknown } & EventInit = {}) {
        super(type, init);
        this.dataTransfer = init.dataTransfer ?? null;
      }
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

let section: HTMLElement;

const countIngredients = (): number => section.querySelectorAll('.cauldron_ingredient').length;
const getFrame = (): HTMLElement => section.querySelector('.cauldron_frame')!;
const firstShelfId = (): string => Object.keys(getState().shelfStock)[0]!;

function dragEvent(type: string, id: string, types: string[] = [INGREDIENT_DRAG_ID]): Event {
  const dataTransfer = { types, getData: () => id, dropEffect: 'none' };
  return new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer } as EventInit);
}

const drop = (id: string, types?: string[]): void => {
  section.dispatchEvent(dragEvent('drop', id, types));
};

beforeEach(() => {
  document.body.replaceChildren();
  store.state = { ...beforeStartState };
  section = createCauldronSection();
  document.body.append(section);
  gameActions.startNewGame();
});

afterEach(() => {
  gameActions.exitToMenu();
});

describe('floating ingredients', () => {
  it('shows one ingredient per item in the cauldron', () => {
    gameActions.addToCauldron(firstShelfId());
    gameActions.addToCauldron(firstShelfId());

    expect(countIngredients()).toBe(2);
  });

  it('removes them when the cauldron is cleared', () => {
    gameActions.addToCauldron(firstShelfId());

    gameActions.clearCauldron();

    expect(countIngredients()).toBe(0);
  });

  it('removes them when a new game begins', () => {
    gameActions.addToCauldron(firstShelfId());

    gameActions.startNewGame();

    expect(countIngredients()).toBe(0);
  });
});

describe('brew result', () => {
  it('shows the success effect and the time bonus', () => {
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewSuccess));

    expect(getFrame().classList.contains('cauldron_frame_success')).toBe(true);
    expect(section.querySelector('.cauldron_time-bonus')!.textContent).toBe(
      `+${getSettings().timeBonus}s`,
    );
  });

  it('shows the fail effect without a time bonus', () => {
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewFailed));

    expect(getFrame().classList.contains('cauldron_frame_fail')).toBe(true);
    expect(section.querySelector('.cauldron_time-bonus')).toBeNull();
  });

  it('replaces the previous result effect with the new one', () => {
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewSuccess));
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewFailed));

    expect(getFrame().classList.contains('cauldron_frame_success')).toBe(false);
    expect(getFrame().classList.contains('cauldron_frame_fail')).toBe(true);
  });

  it('resets the effect when a new game begins', () => {
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewFailed));

    gameActions.startNewGame();

    expect(getFrame().classList.contains('cauldron_frame_fail')).toBe(false);
  });
});

describe('reaction popup', () => {
  const fire = (name: string, lines: string[]): void => {
    gameEvents.dispatchEvent(
      new CustomEvent(GAME_SIGNALS.reactionFired, { detail: [{ name, lines }] }),
    );
  };

  it('shows the reaction name and its lines', () => {
    fire('Boom', ['+10 temp', '-1 life']);

    expect(section.querySelector('.reaction-popup_line')!.textContent).toBe(
      '✠ Boom: +10 temp, -1 life',
    );
  });

  it('keeps only the latest popup', () => {
    fire('First', ['a']);
    fire('Second', ['b']);

    const popups = section.querySelectorAll('.reaction-popup');
    expect(popups).toHaveLength(1);
    expect(popups[0]!.textContent).toContain('Second');
  });

  it('is removed when a new game begins', () => {
    fire('Boom', ['a']);

    gameActions.startNewGame();

    expect(section.querySelector('.reaction-popup')).toBeNull();
  });
});

describe('drag & drop', () => {
  it('adds the dropped ingredient to the cauldron', () => {
    const id = firstShelfId();
    const stockBefore = getState().shelfStock[id]!;

    drop(id);

    expect(getState().cauldronIngredients.map((item) => item.id)).toEqual([id]);
    expect(getState().shelfStock[id]).toBe(stockBefore - 1);
  });

  it('ignores a drag that is not an ingredient', () => {
    drop(firstShelfId(), ['text/plain']);

    expect(getState().cauldronIngredients).toEqual([]);
  });

  it('ignores an ingredient that is out of stock', () => {
    const id = firstShelfId();
    store.state = { ...store.state, shelfStock: { ...getState().shelfStock, [id]: 0 } };

    drop(id);

    expect(getState().cauldronIngredients).toEqual([]);
  });

  it('ignores a drop into a full cauldron', () => {
    const capacity = getSettings().cauldronCapacity;
    store.state = { ...store.state, cauldronIngredients: Array(capacity).fill(INGREDIENTS[0]) };

    drop(firstShelfId());

    expect(getState().cauldronIngredients).toHaveLength(capacity);
  });

  it('ignores a drop while the game is paused', () => {
    store.state = { ...store.state, status: 'paused' };

    drop(firstShelfId());

    expect(getState().cauldronIngredients).toEqual([]);
  });

  it('highlights the cauldron only while a valid ingredient is dragged over it', () => {
    section.dispatchEvent(dragEvent('dragover', firstShelfId()));
    expect(section.classList.contains('cauldron_container_drop-active')).toBe(true);

    section.dispatchEvent(dragEvent('dragover', firstShelfId(), ['text/plain']));
    expect(section.classList.contains('cauldron_container_drop-active')).toBe(false);
  });

  it('removes the highlight after the drop', () => {
    section.dispatchEvent(dragEvent('dragover', firstShelfId()));

    drop(firstShelfId());

    expect(section.classList.contains('cauldron_container_drop-active')).toBe(false);
  });
});
