import { clearLeaderboard, formatDate, getLeaderboard } from '../../../logic/leaderboard';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

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
        textContent: 'All results will be permanently deleted.',
      }),
      error,
      createElement('div', {
        className: 'dialog__actions dialog__actions--row',
        children: [
          createElement('button', {
            className: 'dialog__button',
            textContent: 'Cancel',
            attributes: { type: 'button' },
            events: { click: showLeaderboard },
          }),
          createElement('button', {
            className: 'dialog__button dialog__button--danger',
            textContent: 'Clear',
            attributes: { type: 'button' },
            events: { click: handleClear },
          }),
        ],
      }),
    ],
  });
}

function createLeaderboardView(): HTMLElement {
  const entries = getLeaderboard();

  const rows =
    entries.length > 0
      ? entries.map((entry, index) =>
          createElement('tr', {
            children: [
              createElement('td', { textContent: String(index + 1) }),
              createElement('td', { textContent: entry.name }),
              createElement('td', { textContent: String(entry.score) }),
              createElement('td', { textContent: formatDate(entry.date) }),
            ],
          }),
        )
      : [
          createElement('td', {
            textContent: 'No results yet',
            attributes: { colspan: '4' },
          }),
        ];

  const headRow = createElement('tr', {
    children: ['Rank', 'Name', 'Score', 'Date'].map((title) =>
      createElement('th', { textContent: title, attributes: { scope: 'col' } }),
    ),
  });

  const table = createElement('table', {
    className: 'dialog__table',
    children: [
      createElement('thead', { children: [headRow] }),
      createElement('tbody', { children: rows }),
    ],
  });

  const clearButton = createElement('button', {
    className: 'dialog__button dialog__button--danger',
    textContent: 'Clear Leaderboard',
    attributes: { type: 'button' },
    events: { click: () => openDialog(createConfirmView()) },
  });
  clearButton.disabled = entries.length === 0;

  return createElement('div', {
    className: 'dialog__content',
    children: [
      createElement('h2', { className: 'dialog__title', textContent: 'Leaderboard' }),
      table,
      createElement('div', {
        className: 'dialog__actions dialog__actions--row',
        children: [
          clearButton,
          createElement('button', {
            className: 'dialog__button',
            textContent: 'Close',
            attributes: { type: 'button' },
            events: { click: closeDialog },
          }),
        ],
      }),
    ],
  });
}
