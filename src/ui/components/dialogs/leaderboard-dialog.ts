import { DIFFICULTIES } from '../../../data/game';
import { translate } from '../../../i18n';
import { clearLeaderboard, formatDate, getLeaderboard } from '../../../logic/leaderboard';
import { createElement } from '../../../utils/helpers';
import type { Difficulty, ILeaderboardEntry } from '../../../utils/types';
import { closeDialog, openDialog } from '../dialog';

const COLUMN_KEYS = [
  'leaderboard.column.rank',
  'leaderboard.column.name',
  'leaderboard.column.score',
  'leaderboard.column.difficulty',
  'leaderboard.column.date',
];

export const showLeaderboard = (): void => openDialog(createLeaderboardView());

function createConfirmView(): HTMLElement {
  const error = createElement('p', {
    className: 'dialog__error',
    attributes: { role: 'alert' },
  });

  const handleClear = (): void => {
    if (clearLeaderboard() === 'failed') {
      error.textContent = translate('leaderboard.clearFailed');
      return;
    }
    showLeaderboard();
  };

  return createElement('div', {
    className: 'dialog__content',
    children: [
      createElement('h2', {
        className: 'dialog__title',
        textContent: translate('leaderboard.confirm.title'),
      }),
      createElement('p', {
        className: 'dialog__text',
        textContent: translate('leaderboard.confirm.text'),
      }),
      error,
      createElement('div', {
        className: 'dialog__actions dialog__actions--row',
        children: [
          createElement('button', {
            className: 'dialog__button--primary',
            textContent: translate('common.cancel'),
            attributes: { type: 'button' },
            events: { click: showLeaderboard },
          }),
          createElement('button', {
            className: 'dialog__button dialog__button--accent',
            textContent: translate('leaderboard.confirm.clear'),
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
    translate(`difficulty.${entry.difficulty}`),
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
                textContent: translate('leaderboard.empty'),
                attributes: { colspan: String(COLUMN_KEYS.length) },
              }),
            ],
          }),
        ];

  const headRow = createElement('tr', {
    children: COLUMN_KEYS.map((key) =>
      createElement('th', { textContent: translate(key), attributes: { scope: 'col' } }),
    ),
  });

  return [
    createElement('h3', {
      className: 'dialog__subtitle',
      textContent: translate(`difficulty.${difficulty}`),
    }),
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
    textContent: translate('leaderboard.clear'),
    attributes: { type: 'button' },
    events: { click: () => openDialog(createConfirmView()) },
  });
  clearButton.disabled = boards.every(({ entries }) => entries.length === 0);

  return createElement('div', {
    className: 'dialog__content',
    children: [
      createElement('h2', {
        className: 'dialog__title',
        textContent: translate('menu.leaderboard'),
      }),
      ...boards.flatMap(({ difficulty, entries }) => createDifficultyTable(difficulty, entries)),
      createElement('div', {
        className: 'dialog__actions dialog__actions--row',
        children: [
          clearButton,
          createElement('button', {
            className: 'dialog__button--primary',
            textContent: translate('common.close'),
            attributes: { type: 'button' },
            events: { click: closeDialog },
          }),
        ],
      }),
    ],
  });
}
