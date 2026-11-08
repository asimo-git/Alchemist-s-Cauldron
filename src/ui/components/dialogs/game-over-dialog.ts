import { addLeaderboardEntry, isTopScore, validatePlayerName } from '../../../logic/leaderboard';
import { isOutOfIngredients } from '../../../logic/stock';
import { getState } from '../../../state/game-state';
import { gameActions } from '../../../state/game-controller';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';
import { showLeaderboard } from './leaderboard-dialog';
import { MAX_NAME_LENGTH } from '../../../data/game';
import { translate } from '../../../i18n';
import type { IGameState } from '../../../utils/types';

export function openGameOverDialog(): void {
  const state = getState();

  const summary = [
    createElement('h2', {
      className: 'dialog__title',
      textContent: translate('dialog.gameOver.title'),
    }),
    createElement('p', { className: 'dialog__reason', textContent: getGameOverReason(state) }),
    createElement('p', {
      className: 'dialog__text',
      textContent: translate('dialog.gameOver.finalScore'),
    }),
    createElement('p', { className: 'dialog__score', textContent: String(state.score) }),
  ];

  const playAgainButton = createElement('button', {
    className: 'dialog__button--accent',
    textContent: translate('dialog.gameOver.playAgain'),
    attributes: { type: 'button' },
    events: {
      click: () => {
        closeDialog();
        gameActions.startNewGame();
      },
    },
  });

  if (!isTopScore(state.score, state.difficulty)) {
    openDialog(...summary, playAgainButton);
    return;
  }

  const input = createElement('input', {
    className: 'dialog__input',
    attributes: {
      type: 'text',
      maxlength: String(MAX_NAME_LENGTH),
      placeholder: translate('dialog.gameOver.namePlaceholder'),
      autocomplete: 'off',
      'aria-label': translate('dialog.gameOver.nameLabel'),
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

  const limitMessage = translate('dialog.gameOver.nameMax', { max: MAX_NAME_LENGTH });

  input.addEventListener('beforeinput', (event) => {
    if (event.isComposing || !event.inputType.startsWith('insert')) return;

    const inserted = event.data?.length ?? 0;
    const selected = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);

    if (input.value.length - selected + inserted > MAX_NAME_LENGTH) {
      error.textContent = limitMessage;
    }
  });

  input.addEventListener('input', () => {
    if (error.textContent === limitMessage && input.value.length < MAX_NAME_LENGTH) {
      error.textContent = '';
    }
  });

  const handleSubmit = (event: Event): void => {
    event.preventDefault();

    const name = input.value.trim();
    const nameError = validatePlayerName(name);
    if (nameError !== undefined) {
      showError(nameError);
      return;
    }

    if (addLeaderboardEntry(name, state.score, state.difficulty) === 'failed') {
      showError(translate('dialog.gameOver.saveFailed'));
      return;
    }

    openDialog(
      ...summary,
      createElement('p', {
        className: 'dialog__text',
        textContent: translate('dialog.gameOver.saved'),
      }),
      createElement('button', {
        className: 'dialog__button--accent',
        textContent: translate('menu.leaderboard'),
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
      createElement('p', {
        className: 'dialog__text',
        textContent: translate('dialog.gameOver.newRecord'),
      }),
      input,
      error,
      createElement('button', {
        className: 'dialog__button dialog__button--primary',
        textContent: translate('dialog.gameOver.save'),
        attributes: { type: 'submit' },
      }),
    ],
  });

  openDialog(...summary, form, playAgainButton);
}

function getGameOverReason(state: Readonly<IGameState>): string {
  if (state.lives <= 0) return translate('dialog.gameOver.reason.lives');
  if (isOutOfIngredients(state)) return translate('dialog.gameOver.reason.ingredients');
  return translate('dialog.gameOver.reason.time');
}
