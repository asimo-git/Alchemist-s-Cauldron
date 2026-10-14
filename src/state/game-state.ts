import { createShelfStock, takePortion } from '../logic/stock';
import type { IIngredient, IGameState } from '../utils/types';
import { INGREDIENTS } from '../data/ingredients';
import { canAddToCauldron } from '../logic/calculate-cauldron';
import { getRecipesByDifficulty } from '../logic/recipe-generator';
import { isBrewSuccess } from '../logic/brew-check';
import { LEVEL_1_LIVES, LEVEL_1_TIME, SCORE_PER_RECIPE } from '../data/game';
import { createCountdown } from '../logic/timer';

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
} as const satisfies Record<keyof IGameState, string>;

export const GAME_SIGNALS = {
  cauldronFull: 'cauldron-full',
  gameBegun: 'game-begun',
} as const;

type GameEventName =
  (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS] | (typeof GAME_SIGNALS)[keyof typeof GAME_SIGNALS];

const store: { state: IGameState } = {
  state: {
    status: 'menu',
    score: 0,
    lives: LEVEL_1_LIVES,
    timeLeft: LEVEL_1_TIME,
    activeRecipe: undefined,
    cauldronIngredients: [],
    shelfStock: {},
    difficulty: undefined,
    lastReactionId: undefined,
  },
};

interface IGameEventTarget extends EventTarget {
  addEventListener(
    type: GameEventName,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: GameEventName,
    listener: EventListener,
    options?: EventListenerOptions,
  ): void;
}

export const gameEvents = new EventTarget() as IGameEventTarget;

function setState(patch: Partial<IGameState>): void {
  const previous = store.state;
  store.state = { ...previous, ...patch };

  for (const key of Object.keys(patch) as (keyof IGameState)[]) {
    if (store.state[key] !== previous[key]) {
      gameEvents.dispatchEvent(new Event(GAME_EVENTS[key]));
    }
  }
}

export const getState = (): Readonly<IGameState> => store.state;

const countdown = createCountdown((timeLeft) =>
  setState(timeLeft === 0 ? { timeLeft, status: 'game-over' } : { timeLeft }),
);

export const gameActions = {
  startNewGame(): void {
    setState({
      status: 'playing',
      activeRecipe: getRecipesByDifficulty(),
      shelfStock: createShelfStock(),
      cauldronIngredients: [],
    });
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.gameBegun));
    countdown.start(LEVEL_1_TIME);
  },

  addToCauldron(ingridientId: string): void {
    const ingredient: IIngredient | undefined = INGREDIENTS.find(
      (item) => item.id === ingridientId,
    );
    if (!ingredient) return;

    const { cauldronIngredients, shelfStock } = store.state;
    if (!canAddToCauldron(cauldronIngredients)) return;
    // show error

    const nextIngredients = [...cauldronIngredients, ingredient];

    setState({
      cauldronIngredients: nextIngredients,
      shelfStock: takePortion(shelfStock, ingridientId),
    });

    if (!canAddToCauldron(nextIngredients)) {
      gameEvents.dispatchEvent(new Event(GAME_SIGNALS.cauldronFull));
    }
  },

  clearCauldron(): void {
    setState({ cauldronIngredients: [] });
  },

  brew(): void {
    const { activeRecipe, cauldronIngredients, score, lives } = store.state;
    if (!activeRecipe || cauldronIngredients.length === 0) return;

    if (isBrewSuccess(cauldronIngredients, activeRecipe)) {
      setState({
        score: score + SCORE_PER_RECIPE,
        cauldronIngredients: [],
        activeRecipe: getRecipesByDifficulty(),
      });
      countdown.addTime();
    } else {
      setState({
        lives: lives - 1,
        cauldronIngredients: [],
      });
    }
  },
};
