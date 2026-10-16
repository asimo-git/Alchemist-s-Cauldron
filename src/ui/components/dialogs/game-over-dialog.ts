import { addLeaderboardEntry, isTopScore, validatePlayerName } from '../../../logic/leaderboard';
import { isOutOfIngredients } from '../../../logic/stock';
import { getState } from '../../../state/game-state';
import { gameActions } from '../../../state/game-controller';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';
import { showLeaderboard } from './leaderboard-dialog';

export function openGameOverDialog(): void {
  const state = getState();

  const summary = [
    createElement('h2', {
      className: 'dialog__title',
      textContent: isOutOfIngredients(state) ? 'Out of Ingredients Game Over' : 'Game Over',
    }),
    createElement('p', { className: 'dialog__text', textContent: 'Final score' }),
    createElement('p', { className: 'dialog__score', textContent: String(state.score) }),
  ];

  const playAgainButton = createElement('button', {
    className: 'dialog__button--accent',
    textContent: 'Play again',
    attributes: { type: 'button' },
    events: {
      click: () => {
        closeDialog();
        gameActions.startNewGame();
      },
    },
  });

  if (!isTopScore(state.score)) {
    openDialog(...summary, playAgainButton);
    return;
  }

  const input = createElement('input', {
    className: 'dialog__input',
    attributes: {
      type: 'text',
      maxlength: '15',
      placeholder: 'Your name',
      autocomplete: 'off',
      'aria-label': 'Player name',
    },
  });

  const error = createElement('p', {
    className: 'dialog__error',
    attributes: { role: 'alert' },
  });

  const showError = (message: string): void => {
    error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  };

  const handleSubmit = (event: Event): void => {
    event.preventDefault();

    const name = input.value.trim();
    const nameError = validatePlayerName(name);
    if (nameError !== undefined) {
      showError(nameError);
      return;
    }

    if (addLeaderboardEntry(name, state.score) === 'failed') {
      showError('Could not save your result: browser storage is unavailable or full.');
      return;
    }

    openDialog(
      ...summary,
      createElement('p', { className: 'dialog__text', textContent: 'Result saved!' }),
      createElement('button', {
        className: 'dialog__button--accent',
        textContent: 'Leaderboard',
        attributes: { type: 'button' },
        events: { click: showLeaderboard },
      }),
      playAgainButton,
    );
  };

  const form = createElement('form', {
    className: 'dialog__form',
    attributes: { novalidate: '' },
    events: { submit: handleSubmit },
    children: [
      createElement('p', { className: 'dialog__text', textContent: 'New record! Enter your name' }),
      input,
      error,
      createElement('button', {
        className: 'dialog__button dialog__button--primary',
        textContent: 'Save',
        attributes: { type: 'submit' },
      }),
    ],
  });

  openDialog(...summary, form, playAgainButton);
}
