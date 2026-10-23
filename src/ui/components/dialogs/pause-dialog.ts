import { gameActions } from '../../../state/game-controller';
import { createElement } from '../../../utils/helpers';
import { closeDialog, openDialog } from '../dialog';

export function openPauseDialog(): void {
  const resumeButton = createElement('button', {
    className: 'dialog__button dialog__button--accent',
    textContent: 'Resume',
    attributes: { type: 'button' },
    events: { click: closeDialog },
  });

  const exitButton = createElement('button', {
    className: 'dialog__button--primary',
    textContent: 'Exit to Menu',
    attributes: { type: 'button' },
    events: { click: openExitConfirmDialog },
  });

  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'Paused' }),
    createElement('div', {
      className: 'dialog__actions',
      children: [resumeButton, exitButton],
    }),
  );
}

export function openExitConfirmDialog(): void {
  const cancelButton = createElement('button', {
    className: 'dialog__button--primary',
    textContent: 'Cancel',
    attributes: { type: 'button' },
    events: { click: openPauseDialog },
  });

  const confirmButton = createElement('button', {
    className: 'dialog__button dialog__button--accent',
    textContent: 'Exit',
    attributes: { type: 'button' },
    events: {
      click: () => {
        gameActions.exitToMenu();
        closeDialog();
      },
    },
  });

  openDialog(
    createElement('h2', { className: 'dialog__title', textContent: 'Exit to Menu?' }),
    createElement('p', {
      className: 'dialog__text',
      textContent: 'Are you sure you want to exit? Your game progress will be lost.',
    }),
    createElement('div', {
      className: 'dialog__actions',
      children: [cancelButton, confirmButton],
    }),
  );

  cancelButton.focus();
}
