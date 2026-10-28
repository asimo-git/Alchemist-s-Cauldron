import { STATS } from '../data/game';
import { REACTIONS } from '../data/reaction';
import { translate } from '../i18n';
import type {
  Difficulty,
  IIngredient,
  IReaction,
  IReactionPopupData,
  IReactionSideEffects,
  IReactionValues,
} from '../utils/types';

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

const signed = (value: number): string => `${value > 0 ? '+' : '−'}${Math.abs(value)}`;

function describeStat(reaction: IReaction, key: keyof IReactionValues): string | undefined {
  const probe = (n: number): number =>
    reaction.apply({ temperature: n, density: n, magicPower: n })[key];
  const at100 = probe(100);
  const at0 = probe(0);

  if (at100 === 100 && at0 === 0) return undefined;

  const stat = translate(`stat.${key}`);

  if (at0 === 0 && at100 !== 0) {
    return translate('reaction.statPercent', { stat, value: signed(at100 - 100) });
  }
  if (at100 - 100 === at0) {
    return translate('reaction.statFlat', { stat, value: signed(at0) });
  }
  return translate('reaction.statSet', { stat, value: at0 });
}

export function describeReaction(reaction: IReaction): IReactionPopupData {
  const { timeDelta, lives, clearCauldron = false } = reaction.sideEffects ?? {};

  const lines = [
    ...STATS.map(({ key }) => describeStat(reaction, key)),
    timeDelta
      ? translate('reaction.seconds', { count: Math.abs(timeDelta), value: signed(timeDelta) })
      : undefined,
    lives
      ? translate('reaction.lives', { count: Math.abs(lives), value: signed(lives) })
      : undefined,
    clearCauldron ? translate('reaction.cauldronEmptied') : undefined,
  ].filter((line): line is string => line !== undefined);

  return { name: translate(`reaction.${reaction.id}.name`), lines };
}
