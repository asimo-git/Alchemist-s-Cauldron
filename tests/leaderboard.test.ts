// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addLeaderboardEntry,
  clearLeaderboard,
  formatDate,
  getLeaderboard,
  isTopScore,
  validatePlayerName,
} from '../src/logic/leaderboard';
import {
  DIFFICULTIES,
  MAX_ENTRIES,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  TOP_STORAGE_KEY,
} from '../src/data/game';
import type { Difficulty, ILeaderboardEntry } from '../src/utils/types';

const BASE_TIME = 1_700_000_000_000;

const keyOf = (difficulty: Difficulty): string => `${TOP_STORAGE_KEY}-${difficulty}`;

const makeEntry = (
  name: string,
  score: number,
  difficulty: Difficulty,
  date = BASE_TIME,
): ILeaderboardEntry => ({ name, score, difficulty, date });

const seed = (difficulty: Difficulty, entries: unknown): void =>
  localStorage.setItem(keyOf(difficulty), JSON.stringify(entries));

const seedFullTable = (difficulty: Difficulty): void =>
  seed(
    difficulty,
    Array.from({ length: MAX_ENTRIES }, (_, i) =>
      makeEntry(`P${i}`, (i + 1) * 10, difficulty, BASE_TIME + i),
    ),
  );

function addAt(time: number, name: string, score: number, difficulty: Difficulty) {
  vi.setSystemTime(time);
  return addLeaderboardEntry(name, score, difficulty);
}

const names = (difficulty: Difficulty): string[] => getLeaderboard(difficulty).map((e) => e.name);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('validatePlayerName', () => {
  it.each(['Ann', 'a_b-c 1', 'Алиса', 'a'.repeat(MIN_NAME_LENGTH), 'a'.repeat(MAX_NAME_LENGTH)])(
    'accepts "%s"',
    (name) => {
      expect(validatePlayerName(name)).toBeUndefined();
    },
  );

  it.each([
    ['too short', 'a'.repeat(MIN_NAME_LENGTH - 1)],
    ['too long', 'a'.repeat(MAX_NAME_LENGTH + 1)],
    ['forbidden characters', 'bad!name'],
    ['empty', ''],
  ])('rejects a name that is %s', (_, name) => {
    expect(validatePlayerName(name)).toEqual(expect.any(String));
  });
});

describe('addLeaderboardEntry', () => {
  it('saves the entry into the table of its difficulty only', () => {
    expect(addLeaderboardEntry('Ann', 100, 'medium')).toBe('saved');

    expect(names('medium')).toEqual(['Ann']);
    expect(getLeaderboard('easy')).toEqual([]);
    expect(getLeaderboard('hard')).toEqual([]);
  });

  it('stores every difficulty under its own key', () => {
    for (const difficulty of DIFFICULTIES) addLeaderboardEntry('Ann', 100, difficulty);

    for (const difficulty of DIFFICULTIES) {
      const stored = JSON.parse(localStorage.getItem(keyOf(difficulty))!) as ILeaderboardEntry[];
      expect(stored).toHaveLength(1);
      expect(stored[0]!.difficulty).toBe(difficulty);
    }
  });

  it('saves name, score, difficulty and the current time', () => {
    addAt(BASE_TIME + 5, 'Ann', 100, 'easy');

    expect(getLeaderboard('easy')).toEqual([makeEntry('Ann', 100, 'easy', BASE_TIME + 5)]);
  });

  it('sorts entries by score from high to low', () => {
    addLeaderboardEntry('Low', 10, 'easy');
    addLeaderboardEntry('High', 300, 'easy');
    addLeaderboardEntry('Mid', 100, 'easy');

    expect(names('easy')).toEqual(['High', 'Mid', 'Low']);
  });

  it('keeps the earlier result higher when scores are equal', () => {
    addAt(BASE_TIME + 1, 'First', 100, 'easy');
    addAt(BASE_TIME + 2, 'Second', 100, 'easy');
    addAt(BASE_TIME + 3, 'Third', 100, 'easy');

    expect(names('easy')).toEqual(['First', 'Second', 'Third']);
  });

  it('keeps only the top MAX_ENTRIES and drops the lowest ones', () => {
    for (let i = 1; i <= MAX_ENTRIES + 2; i++) addLeaderboardEntry(`P${i}`, i * 10, 'easy');

    const entries = getLeaderboard('easy');
    expect(entries).toHaveLength(MAX_ENTRIES);
    expect(entries.at(-1)!.score).toBe(30); // scores 10 and 20 were dropped
  });

  it('a full table of one difficulty does not affect the others', () => {
    seedFullTable('easy');

    addLeaderboardEntry('Ann', 1, 'hard');

    expect(getLeaderboard('easy')).toHaveLength(MAX_ENTRIES);
    expect(names('hard')).toEqual(['Ann']);
  });
});

describe('isTopScore', () => {
  it('rejects a zero score', () => {
    expect(isTopScore(0, 'easy')).toBe(false);
  });

  it('accepts any positive score while the table is not full', () => {
    expect(isTopScore(1, 'easy')).toBe(true);
  });

  it('in a full table accepts only a score above the last one', () => {
    seedFullTable('easy'); // the last place has 10 points

    expect(isTopScore(11, 'easy')).toBe(true);
    expect(isTopScore(10, 'easy')).toBe(false); // a tie does not push out the earlier result
    expect(isTopScore(5, 'easy')).toBe(false);
  });

  it('checks only the table of the given difficulty', () => {
    seedFullTable('easy');

    expect(isTopScore(5, 'easy')).toBe(false);
    expect(isTopScore(5, 'hard')).toBe(true);
  });
});

describe('reading invalid data', () => {
  it('returns an empty table for broken JSON', () => {
    localStorage.setItem(keyOf('easy'), '{not json');

    expect(getLeaderboard('easy')).toEqual([]);
  });

  it.each([{}, 'text', 42, null])('returns an empty table when the stored value is %j', (value) => {
    seed('easy', value);

    expect(getLeaderboard('easy')).toEqual([]);
  });

  it('drops invalid entries one by one and keeps the valid ones', () => {
    const valid = makeEntry('Ann', 50, 'easy');
    seed('easy', [
      valid,
      { ...valid, name: 'x' }, // name too short
      { ...valid, name: 'bad!name' }, // forbidden characters
      { ...valid, score: -1 },
      { ...valid, score: 1.5 },
      { ...valid, date: 1e20 }, // not a real date
      { ...valid, difficulty: 'hard' }, // belongs to another table
      makeEntry('Bob', 40, 'easy'),
      null,
      'text',
    ]);

    expect(names('easy')).toEqual(['Ann', 'Bob']);
  });

  it('does not lose valid entries when saving next to an invalid one', () => {
    seed('easy', [makeEntry('Ann', 50, 'easy'), { name: 'broken' }]);

    addLeaderboardEntry('Bob', 40, 'easy');

    expect(names('easy')).toEqual(['Ann', 'Bob']);
  });

  it('a broken table does not affect the other difficulties', () => {
    localStorage.setItem(keyOf('easy'), '{not json');
    addLeaderboardEntry('Ann', 100, 'hard');

    expect(getLeaderboard('easy')).toEqual([]);
    expect(names('hard')).toEqual(['Ann']);
  });
});

describe('clearLeaderboard', () => {
  it('clears the tables of all difficulties', () => {
    for (const difficulty of DIFFICULTIES) addLeaderboardEntry('Ann', 100, difficulty);

    expect(clearLeaderboard()).toBe('saved');

    for (const difficulty of DIFFICULTIES) expect(getLeaderboard(difficulty)).toEqual([]);
  });
});

describe('localStorage errors', () => {
  it('addLeaderboardEntry returns "failed" instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(addLeaderboardEntry('Ann', 100, 'easy')).toBe('failed');
  });

  it('clearLeaderboard returns "failed" instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(clearLeaderboard()).toBe('failed');
  });

  it('getLeaderboard and isTopScore survive an unreadable storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    expect(getLeaderboard('easy')).toEqual([]);
    expect(isTopScore(10, 'easy')).toBe(true);
  });
});

describe('formatDate', () => {
  it('formats as DD.MM.YYYY HH:MM with leading zeros', () => {
    expect(formatDate(new Date(2024, 0, 5, 7, 8).getTime())).toBe('05.01.2024 07:08');
  });

  it('formats two-digit parts as they are', () => {
    expect(formatDate(new Date(2025, 11, 31, 23, 59).getTime())).toBe('31.12.2025 23:59');
  });
});
