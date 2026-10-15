import { createShelfStock, isOutOfIngredients, takePortion } from '../logic/stock';
import type { IIngredient, IGameState } from '../utils/types';
import { INGREDIENTS } from '../data/ingredients';
import { canAddToCauldron } from '../logic/calculate-cauldron';
import { getRecipesByDifficulty } from '../logic/recipe-generator';
import { isBrewSuccess } from '../logic/brew-check';
import { LEVEL_1_LIVES, LEVEL_1_TIME, SCORE_PER_RECIPE } from '../data/game';
import { createCountdown } from '../logic/timer';
import { openGameOverDialog } from '../ui/components/dialogs/game-over-dialog';
import { openPauseDialog } from '../ui/components/dialogs/pause-dialog';

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
    status: 'game-over',
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

// The timer synchronizes each time the status changes.
function syncTimer(): void {
  const { status } = store.state;

  if (status === 'game-over' || status === 'menu') countdown.stop();
  else if (status === 'playing' && !document.hidden) countdown.resume();
  else countdown.pause();
}
////////////////////////////////////////////////////////

function setState(patch: Partial<IGameState>): void {
  const previous = store.state;
  store.state = { ...previous, ...patch };

  for (const key of Object.keys(patch) as (keyof IGameState)[]) {
    if (store.state[key] !== previous[key]) {
      gameEvents.dispatchEvent(new Event(GAME_EVENTS[key]));
    }
  }
  console.log(store.state);
  if (store.state.status !== previous.status) syncTimer();
}

export function initGameState(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) gameActions.pauseGame();
  });

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' || event.repeat) return;
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault();
      gameActions.pauseGame();
    },
    { capture: true },
  );

  gameEvents.addEventListener(GAME_EVENTS.status, () => {
    if (getState().status !== 'game-over') return;
    openGameOverDialog();
  });
}

export const getState = (): Readonly<IGameState> => store.state;

const countdown = createCountdown(
  (timeLeft) => setState({ timeLeft }),
  () => setState({ status: 'game-over' }),
);

export const gameActions = {
  startNewGame(): void {
    setState({
      status: 'playing',
      score: 0,
      lives: LEVEL_1_LIVES,
      timeLeft: LEVEL_1_TIME,
      activeRecipe: getRecipesByDifficulty(),
      shelfStock: createShelfStock(),
      cauldronIngredients: [],
    });
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.gameBegun));
    countdown.start(LEVEL_1_TIME);
  },

  addToCauldron(ingridientId: string): void {
    if (store.state.status !== 'playing') return;
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
    if (store.state.status === 'playing' && isOutOfIngredients(store.state)) {
      setState({ status: 'game-over' });
    }
  },

  brew(): void {
    if (store.state.status !== 'playing') return;
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

    if (store.state.lives === 0 || isOutOfIngredients(store.state)) {
      setState({ status: 'game-over' });
    }
  },

  pauseGame(): void {
    if (store.state.status !== 'playing') return;
    setState({ status: 'paused' });
    openPauseDialog();
  },

  resumeGame(): void {
    if (store.state.status === 'paused') setState({ status: 'playing' });
  },

  exitToMenu(): void {
    setState({
      status: 'menu',
      score: 0,
      lives: LEVEL_1_LIVES,
      timeLeft: LEVEL_1_TIME,
      activeRecipe: undefined,
      shelfStock: {},
      cauldronIngredients: [],
    });
    // setState({ status: 'menu', cauldronIngredients: [] });
  },
};
