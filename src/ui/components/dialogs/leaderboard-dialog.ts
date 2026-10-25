import { DIFFICULTIES } from '../../../data/game';
import { clearLeaderboard, formatDate, getLeaderboard } from '../../../logic/leaderboard';
import { capitalize, createElement } from '../../../utils/helpers';
import type { Difficulty, ILeaderboardEntry } from '../../../utils/types';
import { closeDialog, openDialog } from '../dialog';

const COLUMNS = ['Rank', 'Name', 'Score', 'Difficulty', 'Date'];

export const showLeaderboard = (): void => openDialog(createLeaderboardView());

function createConfirmView(): HTMLElement {
  const error = createElement('p', {
    className: 'dialog__error',
    attributes: { role: 'alert' },
  });

  const handleClear = (): void => {
    if (clearLeaderboard() === 'failed') {
      error.textContent = 'Could not clear the leaderboard: browser storage is unavailable.';
      return;
    }
    showLeaderboard();
  };

  return createElement('div', {
    className: 'dialog__content',
    children: [
      createElement('h2', { className: 'dialog__title', textContent: 'Clear leaderboard?' }),
      createElement('p', {
        className: 'dialog__text',
        textContent: 'All results on every difficulty will be permanently deleted.',
      }),
      error,
      createElement('div', {
        className: 'dialog__actions dialog__actions--row',
        children: [
          createElement('button', {
            className: 'dialog__button--primary',
            textContent: 'Cancel',
            attributes: { type: 'button' },
            events: { click: showLeaderboard },
          }),
          createElement('button', {
            className: 'dialog__button dialog__button--accent',
            textContent: 'Clear',
            attributes: { type: 'button' },
            events: { click: handleClear },
          }),
        ],
      }),
    ],
  });
}

function createRow(entry: ILeaderboardEntry, rank: number): HTMLElement {
  const cells = [
    String(rank),
    entry.name,
    String(entry.score),
    capitalize(entry.difficulty),
    formatDate(entry.date),
  ];

  return createElement('tr', {
    children: cells.map((text) => createElement('td', { textContent: text })),
  });
}

function createDifficultyTable(
  difficulty: Difficulty,
  entries: ILeaderboardEntry[],
): HTMLElement[] {
  const rows =
    entries.length > 0
      ? entries.map((entry, index) => createRow(entry, index + 1))
      : [
          createElement('tr', {
            children: [
              createElement('td', {
                textContent: 'No results yet',
                attributes: { colspan: String(COLUMNS.length) },
              }),
            ],
          }),
        ];

  const headRow = createElement('tr', {
    children: COLUMNS.map((title) =>
      createElement('th', { textContent: title, attributes: { scope: 'col' } }),
    ),
  });

  return [
    createElement('h3', { className: 'dialog__subtitle', textContent: capitalize(difficulty) }),
    createElement('table', {
      className: 'dialog__table',
      children: [
        createElement('thead', { children: [headRow] }),
        createElement('tbody', { children: rows }),
      ],
    }),
  ];
}

function createLeaderboardView(): HTMLElement {
  const boards = DIFFICULTIES.map((difficulty) => ({
    difficulty,
    entries: getLeaderboard(difficulty),
  }));

  const clearButton = createElement('button', {
    className: 'dialog__button dialog__button--accent',
    textContent: 'Clear Leaderboard',
    attributes: { type: 'button' },
    events: { click: () => openDialog(createConfirmView()) },
  });
  clearButton.disabled = boards.every(({ entries }) => entries.length === 0);

  return createElement('div', {
    className: 'dialog__content',
    children: [
      createElement('h2', { className: 'dialog__title', textContent: 'Leaderboard' }),
      ...boards.flatMap(({ difficulty, entries }) => createDifficultyTable(difficulty, entries)),
      createElement('div', {
        className: 'dialog__actions dialog__actions--row',
        children: [
          clearButton,
          createElement('button', {
            className: 'dialog__button--primary',
            textContent: 'Close',
            attributes: { type: 'button' },
            events: { click: closeDialog },
          }),
        ],
      }),
    ],
  });
}
