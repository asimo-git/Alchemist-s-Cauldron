import type { GAME_EVENTS, GAME_SIGNALS } from '../data/game';

export type Difficulty = 'easy' | 'medium' | 'hard'; // Level 2+
export type GameStatus = 'menu' | 'playing' | 'paused' | 'game-over';

export interface IIngredient {
  id: string;
  name: string;
  icon: string;
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IRecipeRange {
  min: number;
  max: number;
}

export interface IRecipe {
  id: string;
  name: string;
  difficulty: Difficulty;
  temperature: IRecipeRange;
  density: IRecipeRange;
  magicPower: IRecipeRange;
}

export interface IGameState {
  status: GameStatus;
  score: number;
  timeLeft: number;
  lives: number;
  activeRecipe: IRecipe | undefined;
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>; // ingredient id -> portions left
  difficulty: Difficulty;
  lastReactionId?: string | undefined;
  activeReactionIds: string[];
}

export interface IReaction {
  id: string;
  name: string;
  difficulty: Exclude<Difficulty, 'easy'>;
  isActive: (ingredients: IIngredient[]) => boolean;
  apply: (values: IReactionValues) => IReactionValues;
  sideEffects?: IReactionSideEffects;
}

export interface IReactionValues {
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IReactionSideEffects {
  timeDelta?: number; // sec
  lives?: number;
  clearCauldron?: boolean;
}

export interface ILeaderboardEntry {
  name: string;
  score: number;
  date: number; // timestamp, ms
  difficulty: Difficulty;
}

export interface IDifficultySettings {
  shelfIngredients: number;
  cauldronCapacity: number;
  startTime: number;
  recipeTolerance: number;
  lives: number;
  scorePerBrew: number;
  timeBonus: number;
  reactions: number; // Level 3+,
}

type GameEventName =
  (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS] | (typeof GAME_SIGNALS)[keyof typeof GAME_SIGNALS];

export interface IGameEventTarget extends EventTarget {
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

export interface IIngredientTooltip {
  element: HTMLElement;
  show: (anchor: HTMLElement, ingredient: IIngredient) => void;
  hide: (anchor?: HTMLElement) => void;
}
