import { REACTIONS } from '../data/reaction';
import type { Difficulty, IIngredient, IReaction, IReactionSideEffects } from '../utils/types';

export function pickReactionsForGame(difficulty: Difficulty): IReaction[] {
  const count = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 2 : 3;
  const available = REACTIONS.filter((reaction) => reaction.difficulty === difficulty);

  for (let index = available.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const temporaryReaction = available[index]!;
    available[index] = available[randomIndex]!;
    available[randomIndex] = temporaryReaction;
  }

  return available.slice(0, count);
}

export function getReactionsByIds(ids: readonly string[]): IReaction[] {
  return REACTIONS.filter((reaction) => ids.includes(reaction.id));
}

export function getActiveReactions(
  reactions: readonly IReaction[],
  ingredients: IIngredient[],
): IReaction[] {
  return reactions.filter((reaction) => reaction.isActive(ingredients));
}

export function getFiredReactions(
  reactions: readonly IReaction[],
  before: IIngredient[],
  after: IIngredient[],
): IReaction[] {
  return reactions.filter((reaction) => !reaction.isActive(before) && reaction.isActive(after));
}

export function mergeSideEffects(reactions: readonly IReaction[]): Required<IReactionSideEffects> {
  const result: Required<IReactionSideEffects> = {
    timeDelta: 0,
    lives: 0,
    clearCauldron: false,
  };

  for (const { sideEffects } of reactions) {
    result.timeDelta += sideEffects?.timeDelta ?? 0;
    result.lives += sideEffects?.lives ?? 0;
    result.clearCauldron ||= sideEffects?.clearCauldron ?? false;
  }

  return result;
}
