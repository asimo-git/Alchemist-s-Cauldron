import { createShelfStock, isOutOfIngredients, takePortion } from '../logic/stock';
import type {
  IIngredient,
  IGameState,
  Difficulty,
  IGameEventTarget,
  IReactionPopupData,
} from '../utils/types';
import { INGREDIENTS } from '../data/ingredients';
import { canAddToCauldron } from '../logic/calculate-cauldron';
import { getRecipesByDifficulty } from '../logic/recipe-generator';
import { isBrewSuccess } from '../logic/brew-check';
import {
  DIFFICULTY_SETTINGS,
  GAME_EVENTS,
  GAME_SIGNALS,
  POUR_OUT_COST_SECONDS,
  SAVE_TRIGGER_KEYS,
} from '../data/game';
import { createCountdown } from '../logic/timer';
import { openGameOverDialog } from '../ui/components/dialogs/game-over-dialog';
import { openPauseDialog } from '../ui/components/dialogs/pause-dialog';
import { clearSave, loadGame, saveGame } from '../logic/game-save';
import { beforeStartState, getSettings, getState, store } from './game-state';
import {
  describeReaction,
  getFiredReactions,
  getReactionsByIds,
  mergeSideEffects,
  pickReactionsForGame,
} from '../logic/reactions';

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

  persistSave(patch);

  for (const key of Object.keys(patch) as (keyof IGameState)[]) {
    if (store.state[key] !== previous[key]) {
      gameEvents.dispatchEvent(new Event(GAME_EVENTS[key]));
    }
  }

  if (store.state.status !== previous.status) syncTimer();
}

function persistSave(patch: Partial<IGameState>): void {
  const { status } = store.state;

  if (status === 'playing' || status === 'paused') {
    if (Object.keys(patch).some((key) => SAVE_TRIGGER_KEYS.has(key as keyof IGameState))) {
      saveGame(store.state);
    }
  } else if (patch.status === 'game-over' || patch.status === 'menu') {
    clearSave();
  }
}

export function initGameState(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) gameActions.pauseGame();
  });

  gameEvents.addEventListener(GAME_EVENTS.status, () => {
    if (getState().status !== 'game-over') return;
    openGameOverDialog();
  });
}

const countdown = createCountdown(
  (timeLeft) => setState({ timeLeft }),
  () => setState({ status: 'game-over' }),
);

export const gameActions = {
  startNewGame(): void {
    setState({
      status: 'playing',
      score: 0,
      lives: getSettings().lives,
      timeLeft: getSettings().startTime,
      activeRecipe: getRecipesByDifficulty(store.state.difficulty),
      shelfStock: createShelfStock(DIFFICULTY_SETTINGS[store.state.difficulty].shelfIngredients),
      cauldronIngredients: [],
      activeReactionIds: pickReactionsForGame(store.state.difficulty).map(
        (reaction) => reaction.id,
      ),
      lastReactionId: undefined,
    });
    console.log(store.state.activeReactionIds);
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.gameBegun));
    countdown.start(getSettings().startTime);
  },

  addToCauldron(ingridientId: string): void {
    if (store.state.status !== 'playing') return;
    const ingredient: IIngredient | undefined = INGREDIENTS.find(
      (item) => item.id === ingridientId,
    );
    if (!ingredient) return;

    const { cauldronIngredients, shelfStock, lives } = store.state;
    if (!canAddToCauldron(cauldronIngredients)) return;
    if ((shelfStock[ingridientId] ?? 0) <= 0) return;

    const nextIngredients = [...cauldronIngredients, ingredient];
    const fired = getFiredReactions(
      getReactionsByIds(store.state.activeReactionIds),
      cauldronIngredients,
      nextIngredients,
    );

    if (fired.length > 0) {
      const detail: IReactionPopupData[] = fired.map((reaction) => describeReaction(reaction));
      gameEvents.dispatchEvent(new CustomEvent(GAME_SIGNALS.reactionFired, { detail }));
    }

    const effects = mergeSideEffects(fired);
    const finalIngredients = effects.clearCauldron ? [] : nextIngredients;

    setState({
      cauldronIngredients: finalIngredients,
      shelfStock: takePortion(shelfStock, ingridientId),
      lives: Math.max(0, lives + effects.lives),
      ...(fired.length > 0 && { lastReactionId: fired.at(-1)!.id }),
    });

    if (effects.timeDelta !== 0) countdown.adjustTime(effects.timeDelta);

    if (!canAddToCauldron(finalIngredients)) {
      gameEvents.dispatchEvent(new Event(GAME_SIGNALS.cauldronFull));
    }

    const isOutOfLives = store.state.lives === 0;
    const outOfStock = effects.clearCauldron && isOutOfIngredients(store.state);
    if (store.state.status === 'playing' && (isOutOfLives || outOfStock)) {
      setState({ status: 'game-over' });
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

    if (
      isBrewSuccess(
        cauldronIngredients,
        activeRecipe,
        getReactionsByIds(store.state.activeReactionIds),
      )
    ) {
      setState({
        score: score + getSettings().scorePerBrew,
        cauldronIngredients: [],
        activeRecipe: getRecipesByDifficulty(store.state.difficulty),
      });
      countdown.adjustTime(getSettings().timeBonus);
      gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewSuccess));
    } else {
      setState({
        lives: lives - 1,
        cauldronIngredients: [],
      });
      gameEvents.dispatchEvent(new Event(GAME_SIGNALS.brewFailed));
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
    setState({ ...beforeStartState, difficulty: store.state.difficulty });
  },

  continueGame(): void {
    const save = loadGame();
    if (!save) return;

    setState({ ...save, status: 'paused' });
    gameEvents.dispatchEvent(new Event(GAME_SIGNALS.gameBegun));
    countdown.start(save.timeLeft);
    countdown.pause();
    openPauseDialog();
  },

  setDifficulty(difficulty: Difficulty): void {
    setState({ difficulty });
  },

  pourOut(): void {
    if (store.state.status !== 'playing' || store.state.cauldronIngredients.length === 0) return;

    countdown.adjustTime(POUR_OUT_COST_SECONDS);

    if (store.state.status !== 'playing') return;
    gameActions.clearCauldron();
  },
};
